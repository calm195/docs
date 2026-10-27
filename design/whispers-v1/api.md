# 悄悄鲤接口行为与兼容 v1.0

本文规定[OpenAPI](../../contracts/whispers-v1/openapi.json)之外的事务及交互语义；REQ-009、REQ-010、REQ-011、REQ-014–REQ-020。模块版本为`whispers/1.0.0`，路径前缀`/api/v1`。本交付是设计契约，所有新增路由未实现。

## 1. 通用请求与响应

- 成功返回`{code:0,message,data,request_id}`；204无JSON正文。202只表示持久受理，不表示公开、解锁、送达或物理删除。
- 请求字段精确匹配、禁止未知／重复键、大小写变体和未声明null；有效UTF-8且无孤立代理项。500字按Unicode码点计，不trim；业务文本不得全空白。单个JSON请求传输上限16KiB，超限400 `VALIDATION_FAILED`。
- UUID小写标准形式；所有写操作包括DELETE均带UUID格式`Idempotency-Key`。DELETE的`expected_version`放JSON正文；前端适配必须支持，不能挪到未定义的query。
- `Authorization: Bearer`按学生／后台域分离。公开列表接受无token；有token但无效返回401。无效／他人私有资源404，合法主体无动作资格403。不在错误中回显正文、作者或命中片段。
- 所有响应含`Cache-Control: no-store`、`Pragma: no-cache`与`X-Request-ID`；私密页面不缓存。后台和学生端只在内存保存令牌、正文、草稿、游标及待重试请求，退出／切账号清理。
- 时间为RFC3339 UTC、必须以Z结尾，输入精度到秒；后端比较DB时间，前端用`server_now`计算展示偏移。胶囊选择默认以配置响应的server_now加24小时，用户确认时仍由服务端校验60秒至365天窗口。

### 幂等与版本

幂等键绑定当前主体、HTTP方法、规范资源路径及完整请求体摘要。先认证和对象当前可访问性，再校验同键请求；同键异体409 `IDEMPOTENCY_CONFLICT`。已成功同键不重复检查原旧版本后再次执行，只复核当前权限并返回当前可安全读取的结果；对象失效时404／409，不能回放已删正文。403、409版本错误、429及执行前503不占用成功回执，明确未执行时可以修正后用新键请求；超时未知结果必须保持原键原体重试。

回执与业务同事务提交，至少保留至对应主体／资源的业务幂等生命周期结束；资源被清理后保留最小key tombstone至账号注销，禁止过期键重新创建同一逻辑写入。匿名注销回执仍沿用既有协议，本模块不顺带解决旧注销响应丢失问题。

| 字段 | 取值来源 | 禁止替代 |
| --- | --- | --- |
| `expected_version` | 正在修改的OwnerPost／OwnerComment／NicknameState／Capsule／后台案件／BlockEntry版本 | Me.version、content_version、父帖版本不能代替 |
| `expected_post_version` | 刚读取的PublicPost.version | 不从评论／本地计数推算 |
| `expected_comments_epoch` | 同一PublicPost.comments_epoch | 不使用content_version或旧页面开关状态 |
| `expected_hug_version` | 同一PublicPost.my_hug.version，未建行为记录为0 | 抱抱总数／帖子version不是此字段 |
| `expected_content_version` | ReviewDetail.source.content_version | 不是审核案件version |
| 举报来源`content_version` | 当前公开帖子／评论响应 | 不接收客户端正文或作者ID |
| 处罚`expected_report_version` | ReportDetail.version且当前confirmed | 不接收任意用户ID代替举报对应主体 |

Post资源version因保存、提交、审核决定、撤回、评论开关、治理及屏障变化递增，评论／抱抱计数变化不递增；comments_epoch因开关、父帖内容／可写上下文变化递增。公开投影的version与相应本人资源一致。昵称的偏好version与nickname_version不同。

### 分页

所有列表仅接受`limit`（默认20、1–50）与`cursor`；本版不提供服务端搜索或状态筛选，前端不得发送猜测参数。游标不透明、签名绑定路由／主体／父资源／上下文版本和排序位置；跨主体、篡改、过长、空值／重复参数400 `VALIDATION_FAILED`；父上下文变化409 `STATE_CONFLICT`，客户端清列表并显式刷新。

公开帖子按公开时间倒序，公开评论按公开时间正序；其余列表按创建时间倒序，同时间以资源ID作同向次排序键。每次请求重新检查可见性，扫描有界候选；空页可带非空next_cursor，客户端只按游标继续，不误判终页。只有next_cursor=null才终止，重复／循环游标立即停止并提供刷新。不承诺在并发更新中快照不变，客户端按资源ID去重，不跳过未读游标。

## 2. 学生端操作约定

完整方法、路径、operationId和字段见OpenAPI；以下是三端必须一致的行为。

| 操作组／关键operationId | 成功结果和行为 |
| --- | --- |
| `whisperConfigGet`／`whisperHelpGet` | 无需会话。配置含版本、限额、年级字典／semi_available及举报类型。缺字典使用version=null／items=[]；缺援助资料返回status=unavailable、version=null、verified_at=null、items=[]，不返回示例联系信息 |
| `whisperWorkspaceGet` | 当前本人模块动作来源；不额外返回账号ID。`verification`只是展示，写入仍复核。创建帖子、封存胶囊等从这里取动作，不依赖旧Me新增词表 |
| `whisperPostCreate`／`whisperPostUpdate` | 返回OwnerPost草稿；不会自动送审。保存后清旧公开内容，页面显示“草稿，尚未提交” |
| `whisperPostSubmit` | 202 OwnerPost，通常scanning；后续通过本人详情刷新状态。无固定3秒轮询，提供主动刷新；离页停止所有在途回填 |
| `whisperPostWithdraw`／`whisperCommentsSetting` | 200 OwnerPost；更新当前版本与epoch，处理后重读公共详情。关闭评论保留既有合规公开评论只读 |
| `whisperPostsList`／`whisperPostGet`／`whisperCommentsList` | 只返回已审最小投影。`identity.is_author`标记是否帖主，`viewer_is_author`供本人编辑入口；游客my_hug=null，登录但未抱抱为active=false,version=0 |
| `whisperCommentCreate`／`whisperCommentUpdate` | 202 OwnerComment；立即进入审核。修改请求同时携本人评论版本及当前父帖version／comments_epoch。被取消评论可在同一当前可用父帖显式改文重提，不自动重放 |
| `whisperOwnCommentsList`／`whisperOwnCommentGet` | 返回本人状态。privacy_hold时body=null；只有受控脱敏完成才提供recovery_body。父帖删除后post_id=null，只允许撤回旧记录与另建评论，不提供旧父帖恢复入口 |
| `whisperHugSet` | PUT目标状态active=true／false，返回权威hug_count与my_hug；不用“toggle”命令。旧版本409先重读，不自动重复改变用户意图 |
| `whisperNicknameGet`／`whisperNicknameSet` | 首次GET返回version=1、active=null、candidate=null；PUT受理新候选，前端只把active.nickname_version用于named输入，candidate不是可用昵称 |
| `whisperCapsuleCreate` | 202 CapsuleSummary且body=null；即使到期后重放创建回执也不返回正文，正文只能从本人详情取。safety_notice_accepted必须true。前端收到受理后立即清正文，超时仅内存保留原键／原体用于明确重试；不把结果未知写成封存成功 |
| `whisperCapsulesList`／`whisperCapsuleGet` | 列表永不返回正文。详情未到期／未批准／隔离／终态body=null；满足当前解锁条件才返回。状态可因时间变为unlocked而version不变 |
| `whisperCapsuleCancel`／`whisperCapsuleDelete` | cancel用于到期前，delete用于已到期或已拒绝／隔离的普通副本；200返回终态且body=null。限定证据不受普通删除影响 |
| `interactionBlockCreate` | 仅接收SourceRef：可访问帖子／评论＋当前内容版本，或明确可访问的public_profile引用；服务器解析主体并与当前账号绑定。返回通用accepted=true，不返回block_id或是否已存在，不能作为匿名作者识别接口 |
| `interactionBlocksList`／`interactionBlockDelete` | 读取所有来源的opaque条目，按block_id＋version解除；删除后不恢复旧申请／评论／消息；对已存在关系的重拉黑不换成新公开身份引用 |
| `whisperReportCreate` | 按当前可访问帖子／评论精确版本及已发布type_code提交，202 ReportAck；描述可省略，长度≤500。自举报拒绝；不接受胶囊／昵称任意ID，昵称问题通过承载它的公开内容举报 |
| `whisperNotificationsList`／`whisperNotificationRead` | 新模块通知独立过滤，read命令只改已读。点击依据target_kind／target_id跳公开帖子或本人胶囊详情；失败只显示不可访问，不恢复通知中的旧正文 |

### 动作投影表

`actions.json`列出所有写操作、投影和版本来源；每个数组只返回当前资源可请求的operationId，未知项客户端关闭对应动作而非忽略校验。

- Workspace：whisperPostCreate仅verified_normal；whisperCapsuleCreate仅normal；interactionBlockCreate仅normal且用于现有公开主页入口。
- OwnerPost：本人可合法保存／提交／撤回／评论开关时返回相应动作。普通限制下不可提交，隐私屏障下不可读原文或保存，仍可撤回。
- PublicPost：normal用户可请求评论／举报／按来源屏蔽；抱抱非作者且normal。关闭评论不返回commentCreate；关系限制错误保持通用，提示不写“对方拉黑了你”。
- PublicComment：normal非本人可举报／屏蔽；本人编辑／撤回使用OwnerComment动作，不能用公共投影的版本绕过本人读取。
- NicknameState、Capsule、Notification、BlockEntry及后台对象分别授予其字段所列动作；Capsule未到期取消、到期删除，阅读是GET，不伪装成写动作。

## 3. 管理端契约与旧模块共存

新增`/admin/whispers/*`使用同一后台Bearer及原三个角色。路径分离只是投影和兼容边界，内部复用同一审核／处罚／危机／隐私事务。新内容不得出现在旧全站接口的默认列表或旧详情中；旧接口访问新kind／ID返回404，避免旧前端误读未知类型和私密数据。启用前需检查所有旧列表、通知及内容类型查询，不仅改一个筛选下拉框。

| 管理能力 | 细则 |
| --- | --- |
| 普通复核 | ReviewSummary仅元数据；ReviewDetail是当前精确命中正文，访问留迹成功才返回。昵称body即候选昵称；胶囊仅普通命中案件可读。approved／rejected提交案件与正文双版本；驳回reason和revision_suggestion必填，批准时可省略 |
| 审核结果 | `content_decision`表示内容判断，`business_outcome`为published／nickname_activated／capsule_locked／capsule_unlocked／cancelled／rejected／privacy_review_required。不得用旧管理端的“所有批准=待发布”或“所有批准=已公开”展示 |
| 限制与解除 | ContentControl按source实体获取治理version；restricted=true立即屏蔽，false仅解除普通限制并触发当前有效内容的新复核，不能取消危机或隐私屏障 |
| 举报与处罚 | ReportDetail只含必要公开内容和投诉描述。confirmed后，可在其source的ContentControl执行处罚；后端根据report_id解析主体，客户端不取得作者账号ID。minor=warning，general=7天mute，severe=永久ban；重复请求不重复处罚，reason必填；本版不提供无举报依据的任意匿名账号处罚 |
| 申诉／警告 | 继续使用现有本人警告／申诉与后台申诉工作台；新增来源通过case引用解析，不向学生通知暴露其他匿名作者。适配现有申诉列表的kind校验，但不得增加胶囊全文或身份字段 |
| 危机 | CrisisDetail含限定正文、identity_status及可空student_number、timeline和投递状态；未认证显示“尚无认证学号”。take_over→in_progress，follow_up保持状态，resolve→resolved且不解除隔离，retry_notification仅重试仍有效失败待办；false-positive→false_positive并转普通复核 |
| 人工升级 | 普通案件详情升级仅同时具有读取和危机权限的超管可发起；危机岗位可从其有权读取的举报来源升级。普通运营只能处理普通案件，不授危机明文权限 |
| 证据删除 | EvidenceScope只返回范围ID／版本／状态，超管明确输入DELETE_EVIDENCE_SCOPE和理由后202，按job_id查询processing／completed；回执不是原始证据内容，processing不宣称清理完成 |

危机关闭／误报后的普通任务可能已因注销、取消或换版不存在，此时保留历史证据和处理状态，不能重建普通内容。举报和普通审核无法访问已进入危机隔离的原文，进入危机工作台须另验角色。

## 4. 匿名黑名单升级是启用前置

现有0.2.1的`GET /me/blocks`返回target_user_id，不能用于新匿名来源。方案以新增`/me/interaction-blocks`承载**全部来源**，内部账号级双向限制不变：

1. 为全部旧关系生成随机block_id，version沿用当前条目版本；保留关系，不清空用户黑名单。新列表只有block_id、version、通用label和allowed_actions；不返回账号ID、来源文章、真实昵称、创建时刻或跨帖作者索引。
2. 升级小程序设置页及公开主页拉黑入口；已知用户也改为SourceRef.kind=public_profile。来源拉黑成功仅返回通用回执；重新加载opaque列表，不把来源内容与返回条目建立可持久映射。
3. 开启`opaque-v1`全局黑名单模式后，旧GET／POST／DELETE `/me/blocks*`对已认证请求统一409 `CLIENT_UPGRADE_REQUIRED`，不因某条目是否为树洞来源而差异化返回；未认证仍401。旧Wire文件保持原字节，新兼容行为由本模块包定义，不假称完全向后兼容。
4. 新Me不再提示旧解除动作；opaque操作从Workspace、PublicPost／PublicComment及BlockEntry读取。旧版本客户端必须升级，不能为了兼容继续返回新匿名目标ID。
5. 后端模块回滚／关闭仍保持opaque保护；只有确认没有新匿名数据且经过专门迁移决策，才可讨论旧模式，不自动降级。

公众响应不会泄露真实账号，但账号级拉黑天然可能被用户通过交互变化进行推断；不承诺抵御所有主动关系探测。采用通用提示、无方向原因、无作者搜索、统一旧接口退出和限频减少关联信息。旧客户端原先已合法获得的公开账号资料不能被新模块“撤回”，也不能作为继续泄漏匿名映射的理由。

## 5. 错误语义

| HTTP／error_code | 场景与客户端动作 |
| --- | --- |
| 400 VALIDATION_FAILED／UNLOCK_TIME_INVALID | 字段、长度、游标、时间或重复参数非法；修正输入后新请求，不能自动重放 |
| 401 UNAUTHENTICATED | token失效／撤销；清理本人草稿、投影及待请求状态，重新登录 |
| 403 VERIFICATION_REQUIRED | 普通已登录但未认证发帖；引导认证，未认证暖评不因此被挡 |
| 403 FORBIDDEN／INTERACTION_UNAVAILABLE | 角色、处罚、自互动或当前关系禁止；不披露匿名作者和具体限制方向 |
| 404 NOT_FOUND | 不存在、他人私有、当前不可公开、已清理或旧路由的新类型；清掉旧正文 |
| 409 VERSION_CONFLICT／STATE_CONFLICT | 资源／父上下文变化或操作已不适用；读最新状态，由用户再次决定 |
| 409 DICTIONARY_CHANGED／NICKNAME_NOT_READY／MODE_UNAVAILABLE | 刷新配置／昵称；缺资料时改选可用匿名档位，不猜字典 |
| 409 IDEMPOTENCY_CONFLICT／CAPSULE_LIMIT | 同键异请求或当前20个活动胶囊额度满；不产生部分写入 |
| 409 CLIENT_UPGRADE_REQUIRED | 旧黑名单接口已安全退出；提示更新，不回退旧字段 |
| 429 RATE_LIMITED | 返回Retry-After及retry_after_seconds，用户稍后重试；不把拒绝当待审 |
| 503 DEPENDENCY_UNAVAILABLE／MODULE_UNAVAILABLE | 依赖缺失或模块未启用；保留失败状态，不本地模拟成功 |
| 500 INTERNAL_ERROR | 使用request_id定位，禁止显示内部堆栈或SQL；结果未知时遵守原键重试 |

## 6. 独立开发输入与兼容检查

小程序和管理端可以从本包生成类型并以examples.json建立替代传输测试；后端以同一请求／响应schema实现和验证。所有字段在schema中明确required／nullable／enum／additionalProperties=false，页面不得把null自动当空对象或正文空字符串。

契约测试必须包含每个写操作的合法请求、缺字段／多字段、错误版本、错误主体、成功回放及同键异体；胶囊锁定正文泄漏、公共author_id泄漏、旧黑名单泄漏、新枚举出现在旧页面必须为负例。静态样例不代替事务、权限或真实供应商测试。契约变更追加新版本并同步三端，不在已固定v1文件原地添加字段。
