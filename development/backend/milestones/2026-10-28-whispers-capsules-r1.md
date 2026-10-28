# 本人时空胶囊交付

日期：2026-10-28（Asia/Shanghai）。任务 B06，基于 B01–B05；REQ-011、REQ-015、REQ-017、REQ-018、REQ-019、REQ-020。契约 `whispers/1.0.0` 不变。状态：本人胶囊领域与五个操作完成，生产启用关闭。

## 基点与提交

- 源码 `develop`，基点 `5579987f41830a6658b7b6c74bbb741aff14ce05`；开始时工作区干净。
- docs `backend-develop`，基点 `ff111246e10f919f478c8e9b39490b9730721e8c`；复用独立工作树，开始时工作区干净。
- 源码提交按依赖顺序：`fbd85ab3e3d2c7d0a91cd2b57d7b414c5b6293fc` → `f267282810221bcd220c5d1a2f354645264bb0fd`。
- 依据：[开发计划](2026-10-27-whispers-backend-plan-r1.md)、[首期需求](../../../requirements/whispers-v1.md)、[领域规则](../../../design/whispers-v1/domain.md)、[接口行为](../../../design/whispers-v1/api.md)、[固定契约](../../../contracts/whispers-v1/openapi.json)。未修改原需求、批准方案、共享契约或既有阶段记录。

## 实现及可测试验收

| 需求 | 实现及验收 |
| --- | --- |
| REQ-011 | 正常登录账号可封存，不要求实名；安全告知必须明确为true，正文≤500码点、不隐式trim。创建后不可改文。以事务内数据库时间按秒截断，验证60秒至365×24小时含边界预约；同一账号guard下检查20个未终结活动额度。Redis日创建预算10次，与活动额度分别权威。 |
| REQ-011、REQ-018 | 创建、列表和取消／删除响应正文始终null，创建回执到期后重放仍不返回正文。详情每次复核本人、当前时间、安全批准和屏障；只有合法unlocked才解密。到期状态变化不递增资源版本；普通处罚不阻断既有本人胶囊读取或清理。 |
| REQ-011、REQ-015 | 复用私密分类器，不使用公开脱敏结果替换信件。普通命中先人工，失败不解锁；拒绝需原因和建议，改写只能新建胶囊。未到期为locked，未批准到期仍scanning／review_pending，拒绝不因时间自动放行。 |
| REQ-011、REQ-017、REQ-019 | 危机在首次安全扫描立即隔离并独立留证，不等预约时间。未实名案件明确无学号。普通删除不影响限定证据；合成误报经专岗确认后重新安全分类并回普通复核，人工批准仍遵守原预约时间。普通后台仅能读取精确命中案件，无全量胶囊搜索。 |
| REQ-011、REQ-018 | 到期前本人可取消；到期或已拒绝／隔离可删除普通副本，受罚也可操作。终结清空密文及当前任务引用、终止审核和解锁工作、使旧outbox失效、清除普通解锁通知及投递引用。人工原因／建议移除原文引用；拒绝决定仅保留固定“普通副本已清理”提示满足既有约束。保留最小终态、技术审核及幂等元数据至主体清理，独立证据不在此图中。 |
| REQ-011、REQ-020 | 解锁工作与封存同事务建立next_at=unlock_at；到期未审持久waiting，不生成完成回执、不消耗错误重试次数。批准事务唤醒waiting；数据库有界补偿覆盖事件丢失。完成回执及唯一事件键保证一次站内通知；通知失败回滚通知事务，合法详情读取不依赖通知成功。 |

五个操作为 `whisperCapsulesList`、`whisperCapsuleCreate`、`whisperCapsuleGet`、`whisperCapsuleCancel`、`whisperCapsuleDelete`，均显式通过 `httpapi.RegisterWhisperCapsules` 注册；create为202，其余成功为200，cancel／delete均使用POST。累计隔离验证47/50个操作，剩余3个opaque黑名单操作在B07继续。

## 文件、状态与迁移取舍

- `internal/whisper/capsules.go`、`capsule_types.go`：本人封存、列表、详情、时间、额度、生命周期和清理；`capsule_worker.go`：预约、唤醒、持久消费、唯一通知及补偿；`policy.go`／`service.go`：稳定额度错误和Workspace动作。
- `internal/httpapi/whisper_capsules.go`／`whisper.go`：五个契约入口、严格JSON及错误映射；相邻单测和 `internal/whisper/capsules_postgres_test.go` 覆盖边界与真实闭环。
- `internal/moderation/whisper_worker.go`：私密批准后唤醒等待解锁；`internal/platform/whisperrate`：日创建预算及真实Redis检查。
- `internal/durable/consumer.go`：新增不终结业务工作的Suspend结果；`internal/entity/durable.go`同步waiting含义；`internal/command`增加活动额度的稳定失败标识。
- `internal/migration`：新增0025及回退／权限／旧版本升级验证；根README同步显式装配和迁移说明。完整文件及指纹见本次验证清单。

新增0025只允许kind为 `whisper_capsule_unlock` 的工作使用waiting，并按胶囊ID保持唯一持久解锁工作。既有0001–0024迁移未改写。存在waiting记录时down明确拒绝破坏性回退，事务及迁移账本不变；没有挂起工作时仍需遵守既有树洞非空回退保护。每个新增／修改数据库对象说明使用中文。

升级步骤：用专用迁移身份显式执行 `up` 至0025，再执行 `permissions`，之后才启动依赖此状态的消费者。普通API／worker启动不做DDL。新增授权限于学生侧预约及终结工作元数据、清理普通通知／投递记录、清理人工原文引用；不授予学生接口写人工决定的权限，也不扩大普通后台胶囊原稿读取范围。

【实施取舍】Wire没有独立privacy_hold胶囊状态，所有尚存的隐私／治理屏障统一投影isolated并隐藏正文，不暴露具体保护来源；终态优先。解锁通知不改变正文或资源版本，读取资格始终独立按DB时间计算。waiting不等同于异常attention，批准仅唤醒waiting，不重置完成、取消或异常待办。取消／删除使普通工作及通知失效，不抹掉独立证据或历史决定技术标识。

## 实际验证及真实边界

实际最终检查均通过：

- 相关包 `make check-fast`，覆盖whisper、moderation、safety、privacy、httpapi、migration、durable、command、chat和whisperrate。
- `make fmt`、`make check`（只读格式、全量vet、race、cover）、`make build`；35项入口Python单测。
- 13项时间／状态边界单测、9项严格HTTP输入单测；6组真实PG胶囊场景通过，包含私密原文不改写、元数据重放、挂起／唤醒／补偿、取消竞争、处罚、通知故障、危机／误报、独立证据、隐私屏障及20额度并发。
- 11份真实HTTP响应通过固定schema校验，覆盖5个成功操作及输入／鉴权／归属／限额拒绝。
- `TestBusinessSchema`、`TestPostgresMigrations`、`TestPostgresStoryPublication` 通过；`TestPostgresWhisperFoundation`额外验证waiting只属于胶囊及拒绝破坏性回退、账本不变。
- 完整 `make integration` 18个顶层测试通过，含真实Redis胶囊日预算、持久工作及恢复、既有业务与MQ重投回归。
- 固定契约仍为50操作、98schema、75请求/响应样例、104正例/12负例、26写动作；共享固定输入未改。
- 两仓库差异及docs文档／固定指纹检查通过；原有378个固定文件保持原字节。

[验证清单](../validation/2026-10-28-whispers-capsules-r1.json)包含26个源码文件和11份证据指纹，[操作矩阵](../validation/2026-10-28-whispers-capsules-operations-r1.json)记录47/50个隔离验证状态，[文档检查](../validation/2026-10-28-whispers-capsules-doc-check-r1.txt)记录固定检查。测试容器已停止，卷保留；未删除或prune其他资源。


真实依赖为Docker PostgreSQL 18.6、Redis、RocketMQ NameServer／Broker，实际Gin HTTP及学生／普通后台／领域worker受限数据库身份。审核持久工作、预约通知、回执、SQL权限及独立删除日志复用真实实现。公开分析器、私密分类器、测试AES KMS、词库、关怀目录和人员通知器均为合成；胶囊专项使用合成命令准入，日窗口另在真实Redis验收。没有发送真实外部通知，不能视为生产内容安全或真实人员通知验收。

时间推进以显式SQL夹具改变隔离胶囊预约与工作next_at；运行代码仍使用真实数据库时钟，精确60秒／365天及前一秒／到点通过纯边界单测验证，不宣称在现实中等待整段预约时间。通知故障用隔离数据库触发器合成，证明失败不半提交且不影响合法读取。危机误报用可控分类器先返回危机误报、专岗确认后重新分类；持续命中安全规则不会被本测试跳过。

调试修正：创建命令补齐框架要求的显式授权回调；禁言夹具补齐七天结束时间；活动额度错误统一进入命令框架稳定映射；补偿测试按队列逐项处理已有到期待办。终结清理最初直接清空拒绝原因触碰既有拒绝决定约束，改为移除原文引用并保留固定清理提示，复跑真实删除和独立证据检查。各次调试复用本记录，最终证据仅固定最终通过输出；旧阶段原字节未改。

## 未完成范围与风险

事实：B06领域、私密审核接入及五个HTTP操作完成。树洞生产装配仍关闭，`CapsuleUnlockWorker`只提供显式消费者／补偿边界；B08仍需装配常驻调度、真实供应商及启停演练。MQ往返在完整集成中回归既有链路，本次预约与审核通过真实持久事件直接驱动，不宣称新消费者已经常驻上线。

B07仍需完成主体注销全图、恢复先重删、幸存评论脱敏及opaque兼容切换；本次普通胶囊终结清理不代替全库、备份或外部全版本物理删除。B09容量和三端真实联调继续待后续。假设后续装配遵守账号guard、胶囊资源锁及持久工作协议，提供正式KMS、分类供应商与词库。建议按计划先推进B07，再启用生产装配。无新增待确认的契约语义；本次不签发G1/G2/G3，不推送、合并或部署。
