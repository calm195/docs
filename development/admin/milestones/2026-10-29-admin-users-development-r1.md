# 管理端用户管理独立开发工作包 r1

日期2026-10-29；UM-03，REQ-022、016、018、019、021。状态：**设计/接入工作包，未实施**。源码只读基点 `develop` / `69f07a2af4c84b4da8026c636c7a06463491f548`，读取时干净；docs基点 `codex/admin-user-management` / `075e52d57a74cb520668c8ddbbb29ae7fc813ea8`。正式开发使用源码develop与docs admin-develop，复核AGENTS及当前差异；本次不修改源码或切换开发仓库分支。

## 1. 固定输入及接口

必读[需求](../../../requirements/admin-users-v1.1.md)、[设计](../../../design/admin-users-v1.1.md)、[契约包](../../../contracts/admin-users-v1/README.md)、[规范语义](../../../contracts/admin-users-v1/semantics.md)、[联调矩阵](../../../design/admin-users-delivery-v1.md)。只消费模块 `admin-users/1.0.0` 三个新增GET；原处罚/申诉及树洞命令消费原契约，版本不能混用。

| 服务方法建议 | Wire | 处理 |
| --- | --- | --- |
| users(filters,cursor,signal) | GET /api/v1/admin/users | UserPageEnvelope；首次省略cursor，完整回传同一筛选 |
| user(id,signal) | GET /api/v1/admin/users/{id} | UserDetailEnvelope；account_version为原普通处罚目标版本 |
| userPenalties(id,cursor,signal) | GET /api/v1/admin/users/{id}/penalties | UserPenaltyPageEnvelope；空页不等于目标不存在 |

按OpenAPI建立独立类型/解析器，对未知枚举、缺失required、错误字段类型及目标ID不匹配报契约错误，不宽松转换成正常状态。昵称空值为null，用“未设置”显示，不将占位传回搜索。禁止实体全量dump、身份资料缓存、自由理由原文及匿名作品聚合。

## 2. 页面与任务

建议菜单“用户管理 → 平台用户”，路由 `/users`，三业务后台角色可进入；与 `/accounts` 管理员页独立。现有源码 `src/router/index.ts` 已有 `/safety/reports`、`/safety/penalties`、`/safety/appeals`、`/moderation`、`/whispers/reports`、`/crisis`，进入实施时核对。

| 任务 | 内容 | 本端完成标准 |
| --- | --- | --- |
| UM-A01 类型/服务 | 新用户查询类型、严格解析、标准封装/headers、URLSearchParams、会话guard、AbortSignal | 三个GET与正反夹具一致，不把404/403/503转成空列表；不调用未定义字段 |
| UM-A02 筛选/表格 | ID精确、昵称包含、认证/限制枚举；状态/昵称筛选组合；注册时间+ID排序 | 关键词规范化和50码点校验，重名独立显示，昵称按文本节点渲染；不全量下载再过滤 |
| UM-A03 分页/并发 | 筛选草稿与已提交条件分开；游标栈、切词重置、请求序号/取消 | 修改未提交条件禁用旧下一页；旧响应不覆盖新结果；上一页按已提交条件重取；无总页数承诺 |
| UM-A04 详情/历史 | 详情抽屉、授权处罚历史、动作导航、空/失败/无权/注销反馈 | 详情与历史独立请求状态，关闭/切主体清空；未授权来源不回显或构造链接 |
| UM-A05 原工作台适配 | 普通罚单用详情account_version替代人工猜值；申诉选择ID适配并重读；只做有权导航 | 下述版本/目标核验流程可独立以合成传输测试；不提供直接处罚/任意解罚 |
| UM-A06 验证 | 解析器、竞态/分页、角色撤销、跳转与错误反馈的有意义测试及构建 | 按本仓AGENTS执行检查，记录Mock传输/真实HTTP范围，交付源码SHA和证据 |

## 3. 原案件页适配与版本规则

【只读事实】`src/components/SafetyWorkspace.vue` 当前读取 `route.query.report` 初始化举报选择；可复用 `/safety/penalties?report=<id>`。`src/composables/useSafety.ts` 在普通处罚分支使用人工accountVersion，现有申诉分支使用appeal.version。`src/services/safety.ts`已封装Bearer、no-store、signal及写命令Idempotency-Key，可沿用方式但不得把新GET响应当旧SafetySummary。

1. 用户详情的 `open_case_workspace` 仅导航到原普通举报工作台选择合格案件；记录当前目标ID到内存上下文。没有具体案件时不弹可提交的处罚表单。若从case_link进入ordinary_report，先读原举报详情再选择；ordinary_review走原审核工作台，不擅自假定旧页面支持新的query参数。
2. 操作者选择普通违规案件后，核对新读取的 `report.subject_id` 与当前用户一致、content_ref/content_version及案件状态合格。再读取 `GET /admin/users/{subject_id}` 取得account_version，绑定到该目标和此次确认。禁止用report.version、旧列表值、as_of或人工输入替代账号版本。
3. 调用原 `POST /admin/users/{id}/penalties`，保持原violation_ref/content_ref/content_version/level/reason/expected_version/Idempotency-Key。只允许在原案件处置页确认。409中止提交、重取账号与案件并再次确认；网络不明结果保留同键同请求，不盲目换键。
4. 历史 `appeal_id` 为普通授权申诉，进入 `/safety/appeals` 时本次工作实现可选ID选择适配，重新读取原申诉详情，不能声称现有页面已经支持 `?appeal=`。申诉用自身version提交uphold/revoke；成功后用户页重新取详情和历史，不猜已全量解罚。
5. 用户页不输出树洞/危机来源链接，不能从普通用户ID构造匿名作品归属。若从原树洞案件工作台处罚，按 `ContentControl.version + ReportDetail.version` 和独立树洞命令处理，不套account_version。危机维持原专用工作台权限与流程。

导航的allowed_actions仅是提示，服务器仍重新授权；字段缺项即隐藏相应入口，不因有super_admin角色就自行补齐。账号详情的全局restriction可能比当前可见处罚摘要更严格，不能根据active_penalties为空显示“正常”。理由展示服务端安全摘要，详情不解密原reason_cipher。

## 4. 独立开发夹具及状态检查

[examples.json](../../../contracts/admin-users-v1/examples.json)包含首/末页、空页、详情/历史及错误、schema负例、搜索向量。可以在测试传输层使用，不得在生产客户端加失败自动Mock兜底。游标synthetic字符串仅在合成传输中有效；真实HTTP必须原样使用后端返回令牌。后端未启用时明确报错与标注未联调。

必须验证：中文中部命中；ASCII大小写；50/51码点（按Unicode码点，不能用JS UTF-16 length替代）；百分号/下划线/引号/反斜杠按字面编码；空词不筛选；重名不合并；更换筛选或limit清栈；旧响应晚到；详情用户A响应不能写入B抽屉；登出/切主体/撤权中断并清空；target404清空详情且刷新列表；503保留明确失败状态而非展示旧数据为最新。

401处理会话，403处理页面授权，400提示重查，409仅来自原写命令时重新确认；敏感数据仅内存，不写localStorage、URL昵称查询串、埋点、console或错误上报。开发请求查询串由服务编码，不能把整URL写日志。无总数也不臆算“共N人”。日期北京时间显示，到期和限制状态依赖后端as_of，不能本地擅自解罚。

## 5. 交付边界与依赖

本次仅完成文档及契约静态验证，未写Vue代码、未跑应用构建/浏览器验证。可独立完成UM-A01–A06的合成传输检查；真实接口、真实处罚/申诉、小程序受限及恢复须按联调矩阵另行验证。本端通过报告必须标注Mock范围，不与联调/验收混写。

后续完整交付记录源码develop精确提交、docs admin-develop基点、包指纹、实际质量检查与已知风险；协议反馈另发新包，不能将前端临时字段倒灌固定契约。新增GET未可用、账号版本供给未完成、日志屏蔽未配置分别阻塞其对应真实检查，不阻塞已定义页面和解析器的独立实现。
