# 体验版改进增量契约 0.2.1-r2

2026-11-07，依据用户提供的《体验版需求》及“按计划执行”授权。本增量继承[基础契约](openapi.v0.2.1.json)、[资料广场](resource-plaza-v1-r2/README.md)和[体验版交互](trial-experience.v0.2.1-r1.md)，仅覆盖以下变更；原版本与指纹不改写。用户已取消OCR能力方案，校园卡继续使用图片审核及人工认证，不安排自动识别。

## 学号

身份申请的 `student_number` 为字符串，匹配 `^[1-9][0-9]{11}$`：四位年份（1000–9999）加八位数字。没有额外限制必须是当前年或某个入学年份范围。保留后八位前导零，不自动删除空格、替换全角数字或猜测字符。后端权威校验返回既有400；已有身份绑定和唯一占用规则不变，不重写历史数据。

## 后台会话恢复

- `POST /api/v1/admin/sessions` 仍返回原会话信封，并设置 `liyuanci_admin_session` Cookie：HttpOnly、SameSite=Strict、Path=/api/v1/admin，正式站点Secure，本机HTTP开发允许非Secure。
- 新增 `GET /api/v1/admin/session`，浏览器带同源Cookie和 `X-Session-Restore: 1`，返回原 `{token,account}` 信封。服务端重新校验生命周期、到期、撤销与权限代次，不延长到期时间。
- 登录与恢复拒绝跨源Origin及非同源Sec-Fetch-Site；正式反向代理与开发代理须保留原始Host。恢复不接受重复自定义头或同名Cookie。普通业务仍使用Bearer，不能仅凭Cookie调用写接口。
- 退出与改密成功清理Cookie；恢复401清理无效Cookie；网络错误或503保留恢复机会。管理端访问令牌只存内存，刷新时先恢复再执行受保护页面加载。

## 资料文件与反馈

新增 `POST /api/v1/admin/resource-files`，使用当前有资料维护权限的后台Bearer及 `Idempotency-Key`，multipart仅一个 `file` 字段。返回201标准信封，数据为 `{id,name,content_type,size}`。同一管理员和幂等键上传相同文件重放同一文件标识，不同内容返回冲突。

文件上限20MiB；支持PDF、TXT、CSV、PNG、JPEG、ZIP、DOC/DOCX、XLS/XLSX、PPT/PPTX，服务端核对扩展名与基本文件签名。它不是恶意文件扫描或文档真实性保证。文件进入私有COS的独立 `resources/` 命名空间，通过服务器上传，不给浏览器长期COS凭据。

资料创建与完整内容更新增加 `file_id`。文件模式使用已上传文件标识，外部链接模式继续使用 `download_url` 与 `extraction_code`；两种模式互斥。已发布资料先下架再更新。更新必须携带当前 `expected_version`；新文件成功绑定后切换引用，上传失败不修改旧资料。

详情和 `GET /resources/:id/download-info?expected_version=...` 增加可空 `file`，形状与上传返回一致。文件模式 `download_url` 为5分钟有效的COS签名附件地址，外部链接模式 `file=null` 且保持原复制流程。下载接口每次重验会话、认证、上架状态、分类和版本；已签发地址到期前仍可能使用，资料下架不撤销已经发出的签名地址。小程序下载前重新请求地址，失败时可重试，不长期缓存签名URL。

未引用文件最早在上传24小时后由隐私清理worker回收；清理认领与文件绑定互斥。替换后旧文件失去引用，至少保留10分钟后进入清理范围，覆盖此前签发地址的5分钟有效期。删除失败保留可重试状态，不把数据库标记视为外部删除成功。

学生列表及详情新增 `feedback_summary`，继续使用 `valid`（有用）、`link_invalid`、`outdated`、`incomplete` 计数及原管理端摘要字段。只统计当前内容版本、活跃账号的反馈；换文件或更新内容后历史反馈保留但不混入新版计数。本人修改反馈沿用既有版本、幂等及唯一约束。

## 首页统计

新增 `GET /api/v1/admin/dashboard?range=month|year`，默认month，当前有效后台会话Bearer鉴权，返回标准信封，禁止缓存。

```json
{
  "range": "month",
  "timezone": "Asia/Shanghai",
  "generated_at": "2026-11-07T10:00:00Z",
  "summary": {
    "registered_users": 0,
    "verified_users": 0,
    "new_users": 0,
    "resources": 0,
    "wishes": 0,
    "fulfilled_wishes": 0
  },
  "series": [],
  "history_note": "当前留存记录回溯口径说明"
}
```

`series` 每项为 `date` 加六个同名整数指标。month含今日共30个日桶，year含本月共12个月桶；空桶补零，时间边界统一北京时间，当日/月截止请求时刻。卡片 `new_users` 为过去30×24小时新增，序列 `new_users` 为该日/月新增，其余序列为累计。

注册/认证只含active学生账号；认证为verified；资料包括草稿、上架及下架；心愿排除已删除草稿，达成按fulfilled计。认证历史按已通过审核的最早 `reviewed_at`，达成历史按仍保留的首次故事创建时间回溯。全部统计在同一SQL语句快照内读取，去重按账号或心愿。

历史不包含已注销、物理删除或缺少事件时间的记录，不是当时的完整快照。认证与达成曲线只包含有事件时间的记录，缺少时间的存量记录不纳入，末点可能小于当前总数。界面必须显示 `history_note`，不能把该曲线用于声称完整历史增长或历史认证总数。

## 界面与交付

管理端分页默认10条，列表使用后端现有限制提供10/20/50；不暴露服务端不支持的100条选项。“工作台”改“首页”，“内容管理”改“资料管理”，子项“资料列表”。模块说明使用中文模块选择与右侧编辑，保留草稿保存/显式发布语义。

先显式应用 `0015_resource_files`，再更新API及隐私清理worker，随后更新管理端与小程序；普通启动不执行DDL。COS下载域名须加入微信downloadFile合法域名，管理端反向代理上传体积与超时需覆盖20MiB文件预算。真实供应商、微信真机和生产上线分别记录验收边界。
