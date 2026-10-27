# 悄悄鲤领域、数据与安全设计 v1.0

依据[需求增量](../../requirements/whispers-v1.md)。本文件为按用户授权完成的设计决定，尚未实现。覆盖REQ-009、REQ-010、REQ-011、REQ-014、REQ-015、REQ-016、REQ-017、REQ-018、REQ-019、REQ-020；Wire字段以[模块契约](../../contracts/whispers-v1/openapi.json)为准。

## 1. 模块边界与装配

新增`internal/whisper`，提供帖子、评论、昵称、胶囊、公开投影、上下文匿名及定时解锁业务服务。复用`command`、`securedata`、`durable`、`moderation`、`safety`、`privacy`和现有学生／后台会话；`internal/httpapi`新增薄适配，`studentapi`显式装配。健康模式不隐式启用业务。

新增配置`Whisper.Enabled`控制模块业务可用性；未启用时配置查询返回`enabled=false`，新增写入和普通读取503 `MODULE_UNAVAILABLE`；关停不撤销已存在的隐私屏障、删除／危机任务或必要本人隐私操作。文档字段为配置结构设计，不伪造现有环境变量。业务实现时再为真实配置入口补中文说明和测试。

内容扫描仍用现有内容worker；增加四种`content_registry.kind`：`whisper_post`、`whisper_comment`、`whisper_nickname`、`whisper_capsule`。定时解锁／站内通知用同一持久工作基础，可在独立worker循环执行，不创建新的Broker或微服务。MQ只携带工作ID／类型／代次，不携带正文、昵称、学号、作者映射或胶囊时间线。

## 2. 身份、匿名与权限

### 2.1 权限谓词

| 谓词 | 判定与适用动作 |
| --- | --- |
| `session_active` | 学生会话有效，账号存在且未deleting／deleted；显式坏token返回401，不能降级游客 |
| `normal` | `session_active`且无当前mute／ban；未确认warning不是禁言 |
| `verified_normal` | `normal`且当前认证有效；发帖创建／编辑／提交需要此条件 |
| 普通互动 | `normal`可评论、抱抱、举报、拉黑及提交昵称，允许未认证用户；不能复用当前“必须认证”的通用写谓词 |
| 本人清理与读取 | 本人撤回内容、取消／删除胶囊、读本人最小状态及通知允许受罚会话；不能藉此读取受屏障原文或恢复公开 |
| 胶囊封存 | `normal`，不要求认证；本人到期读取不以认证／处罚为门槛，仍须安全批准与无屏障 |
| `admin-review` | `review_operator`或`super_admin`；普通命中复核，危机案件拒绝 |
| `admin-safety` | `review_operator`、`crisis_operator`或`super_admin`；仅普通内容治理／举报／处罚，不授予未命中胶囊读取 |
| `admin-crisis` | `crisis_operator`或`super_admin`；危机详情、接手、误报等；无学生卡权限扩张 |
| `admin-review-and-crisis` | 同时满足普通审核读取和危机操作权限；现有三角色中仅`super_admin`，用于从普通审核详情升级 |
| `admin-super` | `super_admin`；证据范围删除与其待办，仍需当前会话、范围版本和理由 |

角色字符串已核对现有管理端常量为`review_operator`、`crisis_operator`、`super_admin`，不新增第四种后台角色。每个请求与最终工作提交都复核数据库当前角色／会话，前端动作提示不构成授权。

### 2.2 匿名映射

`whisper_aliases`以`(post_id, actor_id)`唯一，保存独立随机别名标签。别名不得从账号ID、昵称、学号、HMAC可见编码或跨帖序号生成；相同上下文同人稳定，不同帖子独立随机。公众只看到`label`，不返回alias行ID或actor ID；别名重名允许，不能按别名搜索。`PublicIdentity.is_author`表示该内容作者是否为帖主，`viewer_is_author`表示当前读取者是否为该内容作者，二者不混用。

`named`引用本人当前已批准昵称版本并固化展示快照；修改昵称不替换旧内容。`semi`保存显式标签和字典版本；隐藏设置令响应实时退为`anonymous`、`tags=null`。固定昵称不附加身份标签。受控字典停用的值不再接受新版本，旧已审标签在公开读取中剔除该值并整体退为匿名，避免输出非法组合。

昵称撤销、账号注销或关联隐私屏障必须在每次公开投影同步检查；清理worker尚未更新所有帖子不影响即时隐藏。半匿名缺字典时`semi_available=false`，拒绝提交`MODE_UNAVAILABLE`，完全匿名与固定昵称继续运行；这是资源依赖，不是把半匿名从首期删除。

## 3. 状态、版本与公开规则

### 3.1 帖子

内部字段分离`lifecycle`（active／withdrawn）、`review_state`（draft／scanning／pending／approved／rejected／cancelled）、`restriction_epoch`、`privacy_epoch`及当前／公开内容版本。Wire的`status`是优先级投影：privacy_hold > isolated > restricted > withdrawn > 当前审核／业务状态。

| 命令／事件 | 前置 | 原子结果 |
| --- | --- | --- |
| 创建 | `verified_normal`，输入与匿名方式有效 | `version=1, content_version=1, status=draft`；不创建审核任务 |
| 保存修改 | 本人、当前资源版本、可编辑且无屏障 | 正文版本＋1、资源版本＋1、`comments_epoch`＋1，移除公开投影，取消旧审核及待审评论，保存draft；公开与受限旧版本不直接导出给编辑器 |
| 提交 | 本人，draft／rejected／withdrawn／cancelled且当前身份有效；无治理／隐私限制 | 记录`publish_intent=true`，创建新审核轮次，状态scanning，资源版本＋1；重复同键只一轮。withdrawn重提也重新扫描 |
| 批准 | 当前正文版本、审核轮次、账号资格、发布意愿、限制／隐私代次一致 | 已审脱敏投影和标签／昵称快照写入，状态published，首次公开时间或本新版本公开时间设为当前DB时间，资源版本＋1 |
| 驳回 | 当前审核任务仍有效 | rejected，保存精确版本原因／建议；不公开 |
| 撤回 | 本人，资源版本匹配；受罚也可撤回 | publish_intent=false、withdrawn、资源版本及comments_epoch＋1，清公开读取并取消当前待审帖子／评论任务 |
| 下线／危机／注销 | 对应治理权限或隐私事务 | 即时遮蔽，代次递增、取消旧任务；普通解除仅进入新扫描／人工复核，不能直接published |

仅刷新、读取、计数变化不重写正文版本。帖子不自动过期、不占心愿额度。详情和首页／广场使用同一投影函数，所有公开入口同时检查账号存续与认证、当前批准、发布意愿、昵称状态、无限制／屏障；有任何条件不满足则404或不列出。

### 3.2 暖评与抱抱

评论创建即送审，不设服务端评论草稿。保存`parent_content_version`和创建时`comments_epoch`；批准时还需父帖当前公开且对应正文版本未变、评论开关开启、双方无拉黑、评论者`normal`且原工作未取消。改文递增评论正文版本，隐藏旧评论并新审核；上下文变更时本人显示`context_changed`，须对当前同一帖子重新取版本并显式PUT。父帖已删除则不得PUT，只能走另帖的新评论流程。

关闭评论递增父帖资源版本和comments_epoch，同事务使旧待审评论轮次无效；已有公开评论继续只读。父帖正文变化后旧已公开评论保持原版本绑定，不出现在新正文下；本人状态为context_changed。父帖只是撤回后以**同一正文版本**重审公开时，原合规已公开评论可重新可见；被取消／驳回的评论不恢复。评论自身撤回／治理／隐私限制继续优先。

抱抱记录以`(post_id, actor_id)`唯一，保留`active`与独立`version`。不存在时客户端读0；首次设定为1，之后每次真实状态变化＋1，取消后保留最小tombstone，防止旧请求重新点亮。重复同状态且版本匹配返回原结果；旧版本409。抱抱不因帖子改文自动清空，公开计数只统计存续正常账号的active记录；新增／取消需要当前公开父帖版本，注销／处罚导致计数失效由权威查询或一致性维护处理，不依赖缓存延迟。

禁止自抱。拉黑阻止新增评论／抱抱，取消本人既有抱抱仍允许，避免用户无法收回互动；历史合规互动保留。`allowed_actions`不泄漏具体拉黑方：仅按普遍角色／对象状态提供提示，写入时再按关系判断，并统一`INTERACTION_UNAVAILABLE`，不返回目标账号或关系方向。

### 3.3 昵称

每账号有一条`whisper_preferences`，初始version=1；PUT新增不可变昵称版本并使偏好version＋1，当前candidate替换为新任务，旧未完成候选取消，已批准active不动。新候选批准后切换active，偏好version＋1；候选驳回保留旧active。引用昵称的帖子只能选择提交时仍active且未被撤销的版本；旧已审内容可继续展示其历史合法快照。昵称本身经普通／涉校／危机处理，无法完成脱敏且需改变昵称含义时驳回并给修改建议，不悄悄生成另一个名字。

### 3.4 本人时空胶囊

创建即封存并加密，正文从此不可编辑。数据保存`unlock_at`、`review_state`、`lifecycle`、版本及屏障；Wire状态由当前DB时间计算：未批准为scanning／review_pending／rejected，危机为isolated，批准且未到期为locked，批准且到期为unlocked，取消／删除优先。到期的状态计算不必修改资源version，扫描／取消等持久变更才递增version。

创建或列表永不返回正文；详情只有`status=unlocked`且本人满足当前读取条件才返回body，其他状态body=null。列表即使status=unlocked也body=null。本人未解锁但到期仍在审核时显示“已到时间，等待安全处理”，不能误显示可读。人工拒绝必须有原因／建议，重新写只能创建新胶囊。

取消：在`now < unlock_at`且未取消／删除时允许，立即清普通密文并取消审核／解锁／通知待办。到期后（含仍在审核或被拒绝）使用删除操作；已拒绝／隔离胶囊也允许本人删除普通副本，独立限定证据不被普通删除带走。取消／删除结果保留最小元数据与终态供幂等读取至本人注销，不保留正文或身份快照。

解锁工作持久保存`next_at=unlock_at`；到期但未批准时挂起等审核事件或数据库补偿，不忙等。批准晚于预约时间时按当前条件立即可读，并产生唯一站内通知待办。worker失败不妨碍详情按DB时间读取已批准内容；通知以`(capsule_id, unlocked_notice)`唯一，用户删除后不得补发。通知不含正文与未来信件预览。首次扫描就执行危机分流，不延迟至预约时间。

## 4. 数据模型与约束

以下为数据库设计字段，不能直接序列化成API；所有新表／字段需中文COMMENT及实体映射。编号使用实施时下一可用迁移号，不能改已交付迁移。

| 表 | 核心字段／约束与索引 |
| --- | --- |
| `whisper_preferences` | account_id PK/FK、version、active_nickname_version、next_nickname_version；创建学生账号时或首次访问以唯一键幂等初始化，不创建业务内容 |
| `whisper_nickname_versions` | account_id＋nickname_version复合PK、加密label、已审label、review_state、revoked_at、content_registry_id唯一、control_version；当前昵称及内容引用通过固定版本解析 |
| `whisper_posts` | id UUID PK、owner_id、version、current_content_version、published_content_version可空、lifecycle、publish_intent、comments_open默认true、comments_epoch、privacy_epoch、restriction_epoch、created_at／updated_at／published_at；公开索引`(published_at DESC,id DESC)`、本人索引`(owner_id,created_at DESC,id DESC)` |
| `whisper_post_versions` | post_id＋content_version PK、用途绑定密文body／候选、identity_mode、加密身份输入、已审公开body／identity、school_related、notice_codes；不可变输入与可撤销公开投影分列，禁止将旧批准覆盖新版本 |
| `whisper_aliases` | post_id＋actor_id唯一、随机label；actor_id内部使用，账号删除时清理。新建不同帖子必须重新分配 |
| `whisper_comments` | id、post_id（父删除后可空）、author_id、version、content_version、parent_content_version、comments_epoch、review_state／lifecycle、published_at、privacy_epoch、created_at／updated_at；父帖公开索引及本人索引；parent_content_version保留纯技术值 |
| `whisper_comment_versions` | comment_id＋content_version PK、密文原文／候选、已审公开body／identity、review_result；受屏障后原文不用于普通本人读取 |
| `whisper_hugs` | post_id＋actor_id PK、active、version；取消保留tombstone；计数仅算当前有效主体，账号／父帖删除清理 |
| `whisper_capsules` | id、owner_id、version、加密body、unlock_at、review_state、lifecycle、privacy_epoch、created_at；本人时间索引，待解锁部分索引；无recipient_id，不给他人发送 |
| `interaction_block_refs` | block_id随机PK、owner_id、target_id内部、version；`(owner_id,target_id)`唯一并与既有blocks一致；可与blocks新列合并实现，不改变账号级限制权威 |
| `whisper_notification_refs` | notification_id、kind、target_kind／id、comment_id可空；唯一事件键`(kind, source_id)`，实际送达／已读复用notifications；不存作者身份或正文 |

所有新增内容入`content_registry`并扩展审核／危机／限制类型CHECK；胶囊／昵称以固定单个版本绑定。审核轮次与幂等回执独立于正文版本，避免同正文重提使用旧任务。公共和本人分页均使用固定排序键和签名游标，公开评论按`published_at ASC,id ASC`，其他列表按`created_at DESC,id DESC`，公开帖子按`published_at DESC,id DESC`；本人帖子不因编辑改变列表排序。

ContentRef.id对帖子／评论／胶囊取其实体UUID；昵称取该版本的随机content_registry_id，绝不取account_id。nickname的content_version为nickname_version，后台ContentControl.version取control_version；其余类型的ContentControl.version取实体version。普通来源id不能用于反查主体，处罚根据已确认举报在服务端解析。

数据访问权限：普通API仅业务表所需SELECT／DML及既有命令函数；内容worker仅读取所需密文、写批准投影／限定证据；普通后台池只读授权命中任务，不授全量私密正文表SELECT；危机池专属证据；隐私维护／证据清理／恢复日志继续独立。需要数据库函数投影时按SECURITY DEFINER既有规范固定search_path与最小列，不用给普通后台加整表权限解决胶囊读取。

游标的签名不提供保密性；读取主体绑定使用用途独立密钥生成的不可逆摘要，禁止把账号ID／作者引用放进可Base64解码的载荷。公开游标只携公开排序位置、用途、上下文版本及该绑定摘要，不能含原文或身份。胶囊时间边界以事务内`date_trunc('second', transaction_timestamp())`统一比较，并按秒输出server_now，避免客户端与服务端对60秒边界采用不同精度。

## 5. 事务、并发与持久工作

沿用“后台主体→所有相关学生账号（按UUID排序）→资源按固定等级和ID→工作／回执”的锁协议。把`WhisperPost`／`WhisperNickname`／`WhisperCapsule`／`WhisperComment`排在既有ModerationTask之前，父帖先于评论；既有资源相对顺序保持。新旧用户互锁操作先完整发现参与账号，锁后重验；发现集合变化回滚重试，不在持锁后追加更早顺序的账号。

处罚／拉黑／注销至少持目标账号guard；评论／抱抱持互动双方guard和父帖；审核批准同样持双方及当前父帖；nickname撤销持作者guard。这样处罚与新发布、关闭评论与批准、注销与通知确认均有可解释的线性化顺序。抱抱单用户tombstone在父帖锁内维护，不为每次计数更新帖子version。

业务写入、版本／取消代次、审核任务、outbox及必要站内通知在同一PG事务；外部扫描／脱敏在事务外，结果提交前重锁复核。失败返回503／待处理，不占用业务锁等待供应商。重放以工作ID、当前租约及轮次fencing；任务已取消、版本变化、隐私／限制代次不符则终止，不“补做成功”。

持久工作新增扫描四类型、昵称引用失效补偿、胶囊解锁通知、幸存评论脱敏与清理任务。数据库有界补偿覆盖MQ丢唤醒及worker重启；扫描缺供应商不默认放行。首次评论公开产生一次站内通知；自评论不通知，重审／再次公开不重复发；初次未公开即取消则无通知。

## 6. 治理、注销和恢复

### 6.1 内容与危机

公开帖子／评论使用既有公开脱敏分析器的明确新类型适配，昵称用受限文本判定，胶囊用仅分类的私密分析器（不能拿公开脱敏结果替换私人信件）。所有类型仍受正式三类词库约束。危机建案先隔离，限定保存精确版本及必要主体；未认证用户无学号时将证据身份描述为`not_verified`、student_number=null，不能使危机流程因缺学号失败或借机复制学生卡。

普通运营仅能读当前普通命中任务／相应举报所需精确公开内容；没有所有胶囊、所有别名或所有作者内容查询。普通“限制解除”创建新复核轮次；危机“结案”不解除隔离，“误报”才转普通复核。胶囊误报后依然须到期才可本人读取。超管证据删除删除整个限定范围而非普通内容复活开关。

### 6.2 注销处理矩阵

| 删除主体／资源 | 注销提交时的同步屏障 | 后台清理及幸存内容 |
| --- | --- | --- |
| 帖主 | 所有本人帖与整串评论停止公共读取；取消评论扫描／通知；删除意图先持久 | 清帖子／版本／抱抱／别名；他人评论解除父外键并保留隐私屏障，移除所有帖主关联；评论原文只能供受控脱敏读取，不能在本人接口回显 |
| 评论者 | 本人评论、抱抱及本人匿名映射不可见；计数立即按主体状态过滤 | 删除其版本／映射／通知；父帖继续有效。父帖／其他评论如存在系统记录的引用则写hold并重审，不宣称能自动识别一切自由文本关联 |
| 昵称作者 | 昵称版本及所有引用内容不可公开 | 清昵称原稿、公开label与映射；普通缓存／审计清理，限定证据独立 |
| 胶囊作者 | 本人会话撤销；胶囊／解锁／通知全部取消 | 清密文和普通引用、取消未运行任务；独立证据按原规则处理 |
| 限定证据 | 超管受理后专属范围不可普通读取 | 独立删除日志／专用purger／全副本清理；无真实适配器时保持processing |

幸存评论完成受控脱敏后只在本人`recovery_body`提供安全候选，原body始终null，post_id=null，状态privacy_hold且无旧评论修改动作；作者自行另选公开帖并重新填写新评论，走普通创建／审核，新ID与别名，不携旧父帖引用。资料不足或脱敏失败时`recovery_body=null`并持续隐藏。作者撤回受屏障旧记录可清自己的普通副本。原串永不恢复，不新增“匿名已注销作者主页”。

扩展既有独立删除日志的对象集合与恢复重删发现图，保留技术ID而不保存正文／身份。新表外键、后台非涉案审计、幂等回执、work/outbox、通知及缓存均纳入；恢复后先重删／取消再开放读取与外发，90天副本策略照旧。既有隐私worker缺真实外部清理时不得报告物理全删。

## 7. 默认限额、资源与迁移

本次授权选择的v1默认技术预算：帖子创建／提交合并5次／10分钟、20次／24小时；评论新建／改稿20次／10分钟、100次／24小时；抱抱写60次／分钟；昵称提交3次／24小时；胶囊创建10次／24小时且同时未终结最多20个。滚动窗口以服务端UTC和账号为键，Redis不可用时503，不降级无限写入；只将已接受的新业务命令计入，幂等回放不重复扣预算，取消／删除／撤回保留独立防滥用预算且不被普通发布限额阻挡。接口429带Retry-After及秒数。容量预算可以配置，但不能改变500字、60秒最小预约及365天等Wire／产品边界而不发新版。

胶囊活动额度计scanning／review_pending／locked／isolated；unlocked／rejected／cancelled／deleted不占。创建在账号guard下事务核验，Redis仅防刷，不作为20个额度权威。援助资料与年级字典由资料方提供来源、版本和核验信息；读取缓存仅非个人配置，发布变更时同步使旧配置版本失效。

迁移顺序：新增表／索引／CHECK扩展及最小权限→回填所有已有黑名单随机block_id与版本→验证旧边界→部署新后端但模块关闭→两端升级匿名黑名单及新契约→切换旧黑名单安全退出→再启用树洞。普通进程不运行DDL。存在新业务数据时down拒绝破坏性回退；回滚前端时保持服务端匿名映射保护，不能恢复旧泄漏接口。缺删除／危机／审核装配不能只启用发帖。
