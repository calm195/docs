# 悄悄鲤暖评、抱抱与通知交付

日期：2026-10-28（Asia/Shanghai）。任务 B05，基于 B01–B04。契约 `whispers/1.0.0` 不变。状态：暖评、抱抱与通知完成；生产启用关闭。

## 基点与提交

- 源码分支 `develop`，基点 `7504b2f7399d2eaeba93c6bf453542713cd500aa`；开始时工作区干净。
- docs 分支 `backend-develop`，基点 `6b6eca14a15837cbb06473e6cedc72f287729f2a`；复用独立工作树，开始时工作区干净。
- 精确源码提交（依赖顺序）：`823b5ae7478395186e0b5aa131c05f28257bb03e` → `5579987f41830a6658b7b6c74bbb741aff14ce05`。
- 依据：[开发计划](2026-10-27-whispers-backend-plan-r1.md)、[需求](../../../requirements/whispers-v1.md)、[领域设计](../../../design/whispers-v1/domain.md)、[接口设计](../../../design/whispers-v1/api.md)、[固定契约](../../../contracts/whispers-v1/openapi.json)。未改变批准语义，未修改既有阶段与契约。

## 范围与可测试验收

| 需求 | 实现与验收 |
| --- | --- |
| REQ-009、REQ-010、REQ-015 | 暖评创建即送审，无服务端草稿；未实名正常账号可写。改稿递增正文与资源版本、隐藏旧投影并重新送审；父资源版本与 comments_epoch 同时校验。身份复用三档输入及帖子内稳定别名，跨帖无账号关联键。公开列表发布时间正序；本人列表创建时间倒序，签名游标按用途与主体隔离。 |
| REQ-010 | 关闭评论递增父版本及评论代次，取消待审项；已公开合规暖评继续可读。恢复不重启旧任务。父帖换正文后旧评论不跨版本恢复；同正文撤回后重新批准可恢复仍合规的旧公开评论。失效上下文本人需显式改稿重提，父帖删除后不能 PUT。 |
| REQ-010、REQ-014 | 抱抱以父帖及本人唯一，独立版本与最小 false tombstone；旧版本拒绝，同键重放重新查询当前状态，不恢复旧 active。自抱拒绝，拉黑阻止新增互动但允许取消既有抱抱。实际治理命令拉黑后同事务取消双方待审暖评，解除不恢复旧轮次。 |
| REQ-010、REQ-018 | PostgreSQL 权威计数同步过滤非存续及受罚主体、评论自身屏障与失效昵称；父帖版本不因计数变化递增。父隐私屏障下本人暖评 body 和 identity_input 均为空；不把未完成的幸存评论脱敏当作已可读取。 |
| REQ-010、REQ-020 | 自动及人工最终批准暖评时，在同一事务创建唯一站内事件；自评论不通知，改稿重审不重复。新通知独立列表与已读入口只返回本人技术跳转引用，不存正文或作者账号；回流重新访问当前目标。旧通知列表及已读入口拒绝新类型。 |
| REQ-020 | 新增十个 HTTP 操作复用严格 JSON、16KiB、Unicode、版本、UUID 幂等键、no-store 及稳定错误映射。评论20次/10分钟及100次/24小时、抱抱60次/分钟接入现有 Redis 窗口；仅新接受命令占预算，依赖失败关闭。 |

新增操作：`whisperCommentsList`、`whisperCommentCreate`、`whisperCommentsSetting`、`whisperOwnCommentsList`、`whisperOwnCommentGet`、`whisperCommentUpdate`、`whisperCommentWithdraw`、`whisperHugSet`、`whisperNotificationsList`、`whisperNotificationRead`。继承 B03/B04 的32个后累计42/50个隔离验证，余下5个胶囊与3个opaque黑名单操作待后续。

## 实现文件与权限

- `internal/whisper/comment_commands.go`、`comment_repository.go`、`comment_query.go`：评论写入、父上下文、本人及公开投影、开关；`hugs.go`：抱抱目标态；`notifications.go`：首次站内事件及本人通知；`interaction_types.go`：独立 DTO。
- `internal/whisper/{commands,query,repository,service}.go`：复用多资源版本期望、权威计数、动作与错误边界。
- `internal/httpapi/whisper_interactions.go`：十个显式注册操作；`whisper.go`：通用交互不可用错误映射；相关单测及 `internal/whisper/interactions_postgres_test.go` 验证真实链路。
- `internal/moderation/whisper_source.go`、`whisper_worker.go`：普通暖评不加实名门槛，父帖校验走已有受限公开投影，自动／人工批准共用唯一通知；`internal/safety/repository.go`：关系限制取消旧评论审核。
- `internal/chat/query.go`：旧通知入口隔离；`internal/platform/whisperrate`：新增预算及真实 Redis 用例。
- `internal/migration/sql/bootstrap_roles.sql`：普通后台仅获得通知引用 SELECT/INSERT，学生角色仅补充评论 published_at 的 UPDATE；人工批准通知读取只取评论最小元数据，不扩大后台原稿权限。根 README 同步装配和升级说明。

本次数据库结构版本仍为0024，无新增结构迁移，无改写已应用迁移。使用此适配前显式执行 `permissions` 重放最新最小授权，然后更新业务代码；普通启动不做DDL。回退业务入口时保留已有评论、抱抱取消记录、通知与安全屏障，不能删除这些记录来回退。

本次对[审核治理记录](2026-10-28-whispers-governance-r1.md)补充真实暖评写入闭环：此前评论适配依赖夹具，未覆盖未实名作者自动审核及普通后台人工批准。现在修正遗留认证条件和父帖查询列权限，并覆盖人工批准唯一通知。原记录与指纹保持不变，本记录不重写历史验证结论。

## 实际检查与边界

全部最终检查通过：

- 相关包 `make check-fast`，覆盖 whisper、moderation、safety、privacy、httpapi、migration、chat、whisperrate。
- `make fmt`、`make check`（格式只读、全量 vet、race、cover）、`make build`；35项入口Python单测。
- `TestPostgresWhisperModeration` 通过原有8项和新增互动组；互动组6项子用例包含真实十个HTTP操作、未实名作者、自动及人工批准通知、关闭并发、换版与同正文恢复、抱抱独立版本／幂等／并发、父隐私屏障、拉黑再解除不复活。
- HTTP严格输入单测11项；16份真实HTTP响应通过schema校验，覆盖10个成功操作及输入／鉴权／归属拒绝。
- `TestBusinessSchema`、`TestPostgresMigrations`、`TestPostgresStoryPublication` 迁移与权限回归通过；结构版本保持0024。
- 完整 `make integration`：18个顶层测试通过；真实Redis增加评论、抱抱预算窗口检查，MQ及旧业务链路回归通过。
- 固定契约：50操作、98schema、75请求/响应样例、104正例/12负例、26写动作；共享固定输入未改。
- 两仓库差异检查、docs链接与固定指纹检查通过。原有364个固定条目及字节保持不变；本次固定证据见[文档检查](../validation/2026-10-28-whispers-interactions-doc-check-r1.txt)。

[验证清单](../validation/2026-10-28-whispers-interactions-r1.json)包含23个源码文件与11份证据指纹；[操作矩阵](../validation/2026-10-28-whispers-interactions-operations-r1.json)记录42/50个隔离验证状态。命令日志只脱敏并去除行尾空白，保留实际结果。所有本任务测试容器已停止，卷保留。


真实依赖包括 Docker PostgreSQL、Redis、RocketMQ、实际 Gin HTTP、学生／普通后台／领域worker受限 SQL 身份。审核、事务、持久工作、独立删除日志沿用真实实现；公开分析器、胶囊分类器、测试AES KMS、词库、关怀目录和人员通知供应商为合成。互动专项的命令预算使用合成准入，窗口另由真实 Redis 验证。通知是 PostgreSQL 中真实站内事件；本次没有发送外部人员通知。树洞审核通过真实持久事件直接驱动消费者；MQ往返是既有链路回归，不宣称树洞常驻worker已装配。

调试记录：首次检查遇 Go 缓存沙箱权限限制，使用获准的缓存访问重跑；新增测试格式检查与夹具编译问题修复后复跑。真实改稿验证发现学生角色缺少清除公开时间的列权限，已最小补齐；人工批准发现父帖资格查询触碰后台未获授的正文列，移除重复原稿列条件，继续使用既有安全函数确认公开可读，未扩大后台正文授权。真实Redis新窗口子用例最初插在旧租约索引断言之前，导致旧测试释放了其他桶的预留；已调整子用例顺序保持独立并复跑。首次完整集成因 Docker 地址池耗尽而未完成，新项目容器停止且卷保留，改复用本任务已有隔离网络／卷；不删除或 prune 其他资源。

## 未完成范围与风险

事实：B05完成互动领域及十个 HTTP 操作，树洞生产进程仍未启用。B06本人胶囊用户生命周期、B07完整注销／幸存评论脱敏／不透明黑名单及恢复重删、B08显式生产装配、B09容量与三端交接仍待后续。后台及本站通知不能替代真实外部通知验收；站内通知保留最小跳转引用，失效目标由详情返回不可访问。

假设：后续写入、审核和治理继续遵守共同账号 guard、父帖优先资源锁与受限数据库身份；正式部署需提供真实内容供应商和词库。建议按计划继续 B06，再完成隐私与兼容收口后装配启用。无新增待确认的业务取舍。本次不签发 G1/G2/G3，不推送、合并或部署。
