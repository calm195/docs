# 资料广场API行为提案

日期：2026-10-29。关联 REQ-023、REQ-002、REQ-014、REQ-018、REQ-019。依据[需求 v1.1](../../requirements/resource-plaza-v1.1.md)与[领域设计](domain.md)。**以下路由、字段、动作及错误为设计提案，尚未生成正式OpenAPI、样例包或动作索引，也未实现。**

## 1. 公共规则

路径前缀 `/api/v1`。沿用当前封装：成功 `{code:0,message,data,request_id}`；错误 `{code:<HTTP状态>,message,error_code,request_id}`，错误不包含资料字段。普通GET成功200，资料/分类创建201，反馈及其余有响应体写命令200。不使用前端响应结构猜测权限。

ID采用UUID，规范化为小写；资源/分类/内容版本为正整数，Wire不超过JavaScript安全整数上限；时间为UTC RFC3339。DTO使用字段白名单，未知/重复JSON字段、未知/重复query参数、非法枚举与非规范数字拒绝400。请求大小按字段上限设置有界限制，不静默截断。

所有后台写命令及反馈提交要求一个 `Idempotency-Key`，1–128字符；前端生成UUID作为键。同次超时重试保留键及完整请求，换目标/内容/版本为新命令。学生取链GET无副作用，不带写入幂等键，不因“取链”记录下载成功或累计下载数。

所有资料、分类、反馈及错误响应使用 `Cache-Control: no-store`；不提供公共CDN缓存、ETag/304免鉴权命中、可公开分享的资料摘要或重定向至网盘的接口。请求日志不得保存q或正文中的链接/提取码。

## 2. 学生读取与复制

以下四个GET全部要求当前学生会话及认证读取谓词，分类目录也不对未认证主体公开。

| 方法 / 路径 | 入参 | 成功data |
| --- | --- | --- |
| `GET /resource-categories` | 可选limit、cursor；仅启用分类 | `items: PublicCategory[]`、`next_cursor` |
| `GET /resources` | 可选category_id、q、limit、cursor | `items: ResourceSummary[]`、`next_cursor` |
| `GET /resources/{id}` | 无query | `ResourceDetail` |
| `GET /resources/{id}/download-info` | 必填expected_version | `DownloadInfo`，重新授权、检查可见性及版本 |

数据形状：

- `PublicCategory`：`id,name`。服务端已按分类顺序排列，不返回资料计数。
- `ResourceSummary`：`id,title,category:{id,name},description_excerpt,version,created_at,updated_at,published_at`。只返回当前可见记录，不含链接、提取码、后台操作者或未上架状态信息；摘要取规范化简介前120码点，余下以界面省略标记呈现，不改正文。
- `ResourceDetail`：`id,title,category,description,download_url,extraction_code,version,content_version,created_at,updated_at,published_at,my_feedback,allowed_actions`。my_feedback为当前内容版本的本人反馈或null。普通有权学生动作包含 `copy_download`，同时具备普通写资格时才包含 `submit_feedback`；禁言时仍可复制。没有report动作。
- `DownloadInfo`：`resource_id,version,download_url,extraction_code,copy_text`。无提取码时copy_text就是URL；有提取码时为URL、LF、`提取码：`及码值；不附标题、营销文案或多余空行。

下载信息的resource_id和version必须与请求一致，所有字段必须完整通过解析后才允许调用剪贴板。版本不一致返回409 `VERSION_CONFLICT`，客户端刷新详情并等待再次点击；下架/目标不可见404，认证/封禁变动403，会话失效401；任何一种失败都不能回退复制内存旧URL。因版本变化只在category名称上且resource.version不变时，复制数据仍来源于服务端当前资料，不从旧分类标签拼接链接。

合成说明样例（不能作真实下载验证）：

```text
https://files.example.invalid/share?id=sample#part
提取码：Ab12
```

## 3. 后台资料与分类

所有后台资料/分类入口仅允许 `review_operator` 或 `super_admin`。同一后台账号多个角色按并集判断；仅crisis_operator无目录读取权。

| 方法 / 路径 | 入参 | 成功data |
| --- | --- | --- |
| `GET /admin/resources` | category_id、q、status、limit、cursor均可选；status为draft/published/offline | 后台摘要分页，含status、feedback_summary及allowed_actions，不含链接/码 |
| `GET /admin/resources/{id}` | 无query | `AdminResourceDetail` |
| `POST /admin/resources` | `ResourceInput` | `AdminResourceDetail`，状态draft |
| `PUT /admin/resources/{id}/content` | 完整 `ResourceInput` 与expected_version | 当前 `AdminResourceDetail`，只能draft/offline |
| `POST /admin/resources/{id}/publish` | expected_version | 当前 `AdminResourceDetail` |
| `POST /admin/resources/{id}/offline` | expected_version、reason | 当前 `AdminResourceDetail` |
| `GET /admin/resource-categories` | enabled、limit、cursor可选；enabled缺省返回两种状态 | `AdminCategory[]`分页 |
| `GET /admin/resource-categories/{id}` | 无query | `AdminCategory`，用于编辑前重读版本 |
| `POST /admin/resource-categories` | name；sort_order可选缺省0 | `AdminCategory`，enabled=true |
| `PUT /admin/resource-categories/{id}` | name、sort_order、enabled、expected_version均必填 | 当前 `AdminCategory` |

`ResourceInput`字段：title、category_id、download_url必填；description、extraction_code创建时可省略，默认 `""`/null。内容PUT为完整替换，五个内容字段均须出现，清空简介传 `""`、清空码传null；不支持把缺字段当“保留旧值”的隐式PATCH。title/link/category仍须合法完整，不允许保存半条服务端草稿；未填写完成的表单只在页面内存。

`AdminResourceDetail`为学生详情的内容字段，不含my_feedback，增加 `status`、`visibility_blocked`、`feedback_summary`、`allowed_actions`，不包含学生身份或取链用户列表。`visibility_blocked`仅说明当前不可发布/可见，不向普通运营展开其无权读取的隐私或其他屏障原因。

管理动作提案：draft/offline为 `update`，无屏障且分类合法时加 `publish`；published为 `offline`，没有 `update`。界面“下架后编辑”实际先调用offline，成功重读后才能执行update；不是可以绕过状态的新写接口。写回执只表明当前结果，成功后客户端重读当前详情/列表，不假设它仍处在首次提交后的状态。

`AdminCategory`：`id,name,sort_order,enabled,version,created_at,updated_at`。停用有引用时返回409，不回传学生信息或资料全文；后台操作者可以按category_id查询其有权访问的资料进行迁类。改名失败时不改任何引用；启用/停用及排序修改均通过同一版本化PUT，不提供硬删除。

## 4. 搜索与分页

资料列表：limit默认20、范围1–50；排序 `(created_at DESC,id DESC)`。分类列表：limit默认100、范围1–100；排序 `(sort_order ASC,id ASC)`。`next_cursor`末页显式null，items为空数组表示确实无匹配；不把错误转换为该成功形状，不提供精确总条数。

q为规范化后的标题/简介包含词，最多100码点。category_id存在但停用或无效时返回400 `VALIDATION_FAILED`，客户端刷新分类并提示重选；不存在的合法资料ID才按404。status与enabled仅接受各端点列出的值；全部通过省略参数表达，不使用字符串all/null。

资料条件为 `主体有权 AND 当前可见状态 AND 分类条件 AND (标题包含q OR 简介包含q)`，先过滤再取limit+1。后台资料查询不用学生可见状态过滤，但仍先检查后台管理权限。查询实现使用参数绑定，禁止客户端先拉全量再过滤。

游标为不透明、不可篡改、非可直接解码敏感值的令牌，绑定主体、端点、规范化筛选摘要、limit、排序及位置，建议30分钟到期。每页重新鉴权，游标不能授予读权；更换主体、筛选、limit或端点、篡改、过期均400，不默默忽略游标。回到第一页可重新获取。

静态数据连续翻页不重不漏。资料创建时间不变，但新上架/改类/改搜索字段会改变结果集合；分类改排序也会改变分类分页集合，均不承诺跨页快照。客户端以ID去重并允许刷新，查询/分类变化即清空已加载页，不能合并不同条件的结果。

## 5. 错误提案与页面响应

| HTTP / error_code | 场景 | 客户端处理 |
| --- | --- | --- |
| 400 `VALIDATION_FAILED` | 字段/参数/游标非法、失效分类筛选 | 表单定位错误或重选筛选；不静默截断、改写链接 |
| 401 `UNAUTHENTICATED` | 无效、过期或已撤销会话 | 清空受限数据，进入登录流程 |
| 403 `VERIFICATION_REQUIRED` | 学生认证未通过 | 清空资料，显示对应认证引导；不退出仍有效的登录 |
| 403 `FORBIDDEN` | 封禁、跨主体会话、无后台角色 | 清空受限内容/动作；维持既有申诉入口 |
| 404 `NOT_FOUND` | 资料不存在/未上架/已下架/被屏障 | 移除旧详情及链接，返回列表提示资料暂不可用 |
| 409 `VERSION_CONFLICT` | 资源或分类版本已变化 | 重新读取，保留允许的本地输入供人工核对，不自动覆盖 |
| 409 `STATE_CONFLICT` | 上架编辑、重复新命令、分类不可用或存在屏障 | 重读状态并说明不可执行，保留有效输入 |
| 409 `CATEGORY_IN_USE` | 关联资料未迁走就停用分类 | 提示先处理关联资料，不执行级联 |
| 409 `CATEGORY_NAME_CONFLICT` | 分类重名 | 保留名称输入，提示修改 |
| 409 `IDEMPOTENCY_CONFLICT` | 同键不同请求 | 停止重试，核对原命令；不得自动新键掩盖冲突 |
| 429 `RATE_LIMITED` | 超出既有请求限制 | 明确稍后重试，不绕过身份/业务条件 |
| 500/503既有服务错误 | 存储、加密或依赖失败 | 明确加载/保存失败，不能伪装空列表或复制成功 |

上表部分为本模块拟新增错误；需正式契约和后端映射同步后才能消费，不把相同HTTP状态当作相同业务原因。404不区分隐藏原因，403不回显用户没有权限的资料内容。

## 6. 四类反馈与投稿入口

反馈写入提案：`PUT /resources/{id}/feedback`，要求当前学生可读且无普通写限制，携带 `kind`、`expected_content_version`、`expected_feedback_version`，均必填；另有Idempotency-Key。expected_feedback_version为0表示该内容版本下尚无本人反馈，已有反馈必须使用my_feedback.version；expected_content_version取详情content_version，不使用资料version替代。

kind仅允许 `valid/link_invalid/outdated/incomplete`，分别显示“有效/链接失效/年代久远/不全”。未知值或额外description、附件、account_id拒绝400；提交主体从会话取得。成功200，返回 `resource_id,content_version,kind,version,updated_at`，同样结构用于my_feedback。初次创建version=1，改选递增，相同选项为无变化成功；不提供撤销反馈接口，用户可改选。

内容版本或本人反馈版本冲突返回409 `VERSION_CONFLICT`；失权403、资料下架/不可见404。客户端重新读取本人反馈及当前资料后，由用户确认是否再次提交；超时使用同键原请求重试，不让旧响应覆盖已改选结果。

后台 `feedback_summary` 为 `{content_version,valid,link_invalid,outdated,incomplete,total}`，计数为非负整数，total等于四项之和；无反馈时均为0。列表与详情返回当前内容版本统计，不提供学生名单、身份或历史反馈详情。改变内容版本后统计清零；上下架本身保留统计；注销主体退出统计。后台只据此人工核对和维护，不增加反馈触发的自动下架/处罚接口。

资料投稿仅由小程序固定静态二维码弹窗完成，本期无投稿创建、图片上传、二维码配置或微信消息发送API。模块不新增举报路由、report动作或target_kind；用户要求的反馈不写入旧举报系统。

## 7. 正式化交付要求

下一阶段建立独立 `resource-plaza/1.0.0` 包，包含OpenAPI、字段/状态样例、角色与动作索引、校验器和manifest；新接口标记not-implemented，不原地改写旧固定输入。至少覆盖所有长度边界、null/省略差异、状态/版本冲突、跨主体/撤权、复制重验、分页、反馈改选/去重/注销和不存在的举报动作负例。

正式化时核对本提案与三端schema/错误映射的一致性；未完成前可评审页面和数据方案，不让三个端各自猜测响应。以后发生Wire改变，另发新版本并明确消费者迁移范围。
