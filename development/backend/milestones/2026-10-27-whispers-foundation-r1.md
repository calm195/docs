# 悄悄鲤输入对照与数据命令基础

日期：2026-10-27（Asia/Shanghai）。任务：后端计划 B01、B02；关联 REQ-009、REQ-010、REQ-011、REQ-014、REQ-015、REQ-016、REQ-017、REQ-018、REQ-019、REQ-020。状态：本端数据及命令基础已实现，验证按下表记录；树洞业务接口尚未实现，不能据此启用模块。

## 基点与交付范围

- 用户授权：按[后端计划](2026-10-27-whispers-backend-plan-r1.md)开始开发，先完成B01、B02并同步文档与验证。
- 源码：`develop / c937d534c3d738deb7bd166f21870d91cbd09a0d`；开始时工作区干净，本次改动未提交，没有新源码提交号。当前文件指纹见[验证摘要](../validation/2026-10-27-whispers-foundation-r1.json)。
- docs：`backend-develop / 54134983658bb2ad5e29b43523ab27721379878e`，工作树`/private/tmp/liyuanci-docs-backend-develop`；主检出仍为main同一HEAD。本次保留上次规划未提交的索引、固定清单及两份规划文件，不改其已登记内容。
- 契约：`whispers/1.0.0`；旧站OpenAPI 0.2.1／revision 6保持原样。依据[需求](../../../requirements/whispers-v1.md)、[领域](../../../design/whispers-v1/domain.md)、[协议](../../../design/whispers-v1/api.md)及[联合交付](../../../design/whispers-v1/delivery.md)。

本次只建立数据、约束、权限、资源发现和锁定的基础，不增加运行时演示或业务Mock路由。没有启用树洞、切换旧黑名单接口、修改批准语义、执行日常业务库迁移或部署。

## B01 输入与契约对照

[逐操作矩阵](../validation/2026-10-27-whispers-foundation-contract-r1.json)记录50个唯一operationId、方法和完整路径、REQ、鉴权域、角色／主体谓词、请求必填项、成功响应schema、写动作投影、各版本字段来源、幂等要求及后续验证类别。共32个公开／学生操作、18个后台操作；其中26个写操作。全部运行状态继续为not-implemented，数据基础通过不修改固定契约状态。

| 核对边界 | 当前源码事实 | 本次落实或后续落点 |
| --- | --- | --- |
| 内容类型 | 0004的content_registry、0005的reports／privacy_holds及危机content_type采用CHECK白名单 | 0021增量扩展四类注册／屏障／危机来源；举报仅新增公开帖子和评论 |
| 版本及锁序 | command只识别既有资源和并发字段，父帖需同时绑定资源版本与评论代次 | 新增四类锁、expected_post_version及expected_comments_epoch；保留旧资源相对顺序，两个父帖字段可绑定同一对象但独立校验 |
| 昵称 | 偏好与内容版本是不同对象；ContentRef.id不得为账号ID | preference.version与nickname.control_version分开；WhisperNickname锁使用content_registry_id，返回control_version；偏好分配在账号guard下由后续领域命令维护 |
| 审核分派 | moderation/worker.go及review、crisis分支只处理现有心愿／申请／消息／故事；存在默认旧类型路径 | B04显式接入新kind和私密分类，禁止在该适配完成前产生新kind工作；本次不创建对应业务或任务 |
| 删除图 | privacy/cleanup.go及redaction.go显式遍历旧资源关系，不能自动发现树洞 | 已建隐私代次、可空父引用与recovery_cipher基础；B07须扩展同步屏障、全图清理、幸存评论脱敏和恢复重删后才可启用 |
| 黑名单 | blocks是现有账号级关系权威，旧列表仍返回target_user_id | 本次只加随机block_id及原位回填；B07再实施opaque API、全局旧路由退出和两端迁移，不能把新增列说成匿名兼容完成 |
| 旧接口 | 全站审核／举报／通知现有默认列表及详情不会因新类型自动安全隔离 | B04／B07逐入口隔离新kind；本次不暴露新业务数据，不放宽旧Wire |
| 权限 | 普通后台不能获得全部胶囊／匿名原稿读取能力 | 本次只授权技术元数据及行锁所需版本列；B04以精确命中、角色和访问留迹的受控读取边界接正文 |

【契约核对结论】未发现阻断B01、B02的Wire冲突。胶囊delete和证据删除申请以OpenAPI的POST为准，不按动作名称推断DELETE。匿名来源引用、昵称来源ID、审核案件／正文双版本及后台权限域均照固定包消费；后续发现冲突另建本端记录并按规范发新契约版本。

## B02 实现与数据取舍

### 实体与迁移

新增`0021_whisper_foundation`，不改写0001–0020已应用迁移。十张新表各有独立实体：whisper_preferences、whisper_nickname_versions、whisper_posts、whisper_post_versions、whisper_aliases、whisper_comments、whisper_comment_versions、whisper_hugs、whisper_capsules、whisper_notification_refs。注册进BusinessModels，仅在显式迁移入口与版本SQL同事务同步常规字段，普通API／worker启动无DDL变化。

SQL落实主键、唯一键、外键、版本／代次正值、匿名档位与昵称／字典版本一致性、公开投影审核条件、500码点、JSON形态、胶囊终态清空密文及秒精度时间、评论失去父帖必须有隐私屏障、通知事件唯一与类型一致性。帖子／评论当前版本和昵称偏好通过可延迟外键允许事务内创建、提交时复核；正文版本与注册内容版本也有复合外键。正文原稿、候选及敏感身份输入使用信封密文字段；这些列只约束密文结构，真实加密、身份字典及业务状态转换由后续领域层负责，SQL不把空对象合成夹具当作加密能力验收。

提供公开帖子、本人记录、公开评论、昵称版本及胶囊时间索引。所有新表／字段和新增旧表字段均有中文数据库对象COMMENT，目录检查无缺失。

【取舍】直接在blocks增加非空随机block_id及唯一约束，保留原账号关系主键、版本与时间，不复制第二套关系权威；默认生成同时覆盖升级时仍在写入的旧客户端。重跑不更新已有标识。偏好表未做全量账号回填，唯一键和version默认1支持B03在账号创建或首次使用时幂等准备，不生成业务内容。

【取舍】危机案件增加可空identity_status，允许verified／not_verified；历史未记录保持空，不伪造认证。学号仍属于原有加密证据载荷，未增加明文学号列。B04再完成未认证案件流程及新Wire投影。

### 命令与数据库权限

锁序为既有Conversation → WhisperPost → WhisperNickname → WhisperCapsule → WhisperComment → ModerationTask，其他旧资源相对顺序不变。账号仍先按UUID排序并去重。WhisperNickname用随机注册ID锁昵称版本，control_version与NicknameState.version不混用；父帖资源快照新增CommentsEpoch，不借用会话WriteEpoch。

expected_version支持四类树洞资源；expected_post_version及expected_comments_epoch只绑定WhisperPost，同一请求各字段唯一，均计入请求指纹和持锁后断言。旧epoch或资源version拒绝且不写业务结果，成功同键回放沿用当前授权和安全Resolve，再次使用新键必须重验当前版本。抱抱version=0／复合键、偏好、黑名单等专属断言将在其领域命令中基于账号／父帖锁实现，不能把本次通用资源锁当成这些命令已经完成。

bootstrap_roles.sql显式管理新表所有权、表级及列级ACL，重放会清理新表受管理角色的旧列授权。普通API可写自身业务所需数据；领域worker读输入并写审核投影／通知引用，不能改胶囊原稿；隐私维护可读删及必要屏障字段；普通后台与危机API只能读技术元数据并锁版本，不读胶囊／昵称／帖子评论原稿。探针、后台身份维护与证据角色未获得新业务表权限。正文按精确案件读取的安全函数或等价边界留B04实现，不通过全表SELECT补齐。

下行先取得全部相关表排他锁，再检查所有新增表、黑名单关系、新kind注册／举报／屏障及危机身份元数据；存在任一数据即拒绝，不静默删表或丢弃opaque标识。空库可回退重建，迁移身份已实际验证；有数据降版应保留结构并另行设计，不能用down清理业务。

## 真实与替代边界及验证

| 检查 | 实际结果 | 边界 |
| --- | --- | --- |
| B01矩阵对照 | 50操作、26写操作、18后台操作及输入指纹通过 | 静态契约，不是接口运行通过 |
| make check-fast PACKAGES='./internal/entity/... ./internal/command/... ./internal/migration/...' | 通过 | 无中间件时集成用例显式跳过，另有下面真实检查 |
| make fmt、make check、make build | 通过 | 完整格式、vet、race／cover及当前全部进程构建；宿主Go 1.27.2，容器使用锁定Go 1.25 |
| python3 -m unittest discover -s scripts -p 'test_*.py' -v | 35项通过 | 离线入口回归；未修改日常启停脚本 |
| TestPostgresWhisperFoundation、TestPostgresWhisperLocks | 真实PG通过 | 空库／旧库升级、重放稳定、迁移身份回退、中文注释、约束／权限负例、四类行锁、跨事务锁等待、父版本与epoch、幂等及冲突回滚 |
| TestBusinessSchema、TestPostgresMigrations、TestPostgresStoryPublication | 真实PG通过 | 既有数据库与故事升级回归，迁移账本现为21；旧故事测试先撤销空的0021再构造历史前缀 |
| make integration | 通过，15个顶层业务测试 | 独立PG／恢复PG、Redis、RocketMQ，含新增迁移与命令测试以及既有全部业务链；完整原始输出见验证摘要链接 |
| docs文档／固定指纹及两仓库diff检查 | 通过，登记后再核验新指纹 | 新阶段及证据完成后登记固定；历史已固定条目保持原样 |

真实PG单独检查使用`liyuanci-whisper-foundation-20261027`，固定PostgreSQL 18.6镜像、回环随机端口、临时内存数据目录；Make全链使用独立项目`liyuanci-whisper-foundation-integration-20261027`，不连接日常PG／Redis，不操作其他项目。凭据仅存源码仓库.local忽略目录，未写入记录。外部安全供应商、脱敏、微信、对象、关怀通知等仍为既有合成适配，不能声称生产或三端验收。新增foundation／command测试编入Docker测试阶段和Make集成链，普通运行镜像不包含该测试阶段，未保留专项验收脚本。

调试中发现实体唯一约束声明与SQL不一致，已补齐对应unique映射并复跑PG成功；新增测试导入命名冲突已修复。没有通过修改历史迁移或降低检查门槛绕过失败。

## 变更文件与未完成范围

源码本次文件如下，精确指纹和检查证据位于[验证摘要](../validation/2026-10-27-whispers-foundation-r1.json)：

- `Dockerfile`
- `README.md`
- `deploy/compose/integration.yaml`
- `internal/command/engine.go`
- `internal/command/locks.go`
- `internal/command/types.go`
- `internal/command/whisper_postgres_test.go`
- `internal/command/whisper_test.go`
- `internal/entity/account.go`
- `internal/entity/evidence.go`
- `internal/entity/registry.go`
- `internal/entity/whisper_aliases.go`
- `internal/entity/whisper_capsules.go`
- `internal/entity/whisper_comment_versions.go`
- `internal/entity/whisper_comments.go`
- `internal/entity/whisper_hugs.go`
- `internal/entity/whisper_nickname_versions.go`
- `internal/entity/whisper_notification_refs.go`
- `internal/entity/whisper_post_versions.go`
- `internal/entity/whisper_posts.go`
- `internal/entity/whisper_preferences.go`
- `internal/migration/migration.go`
- `internal/migration/migration_test.go`
- `internal/migration/sql/0021_whisper_foundation.down.sql`
- `internal/migration/sql/0021_whisper_foundation.up.sql`
- `internal/migration/sql/bootstrap_roles.sql`
- `internal/migration/story_publication_test.go`
- `internal/migration/whisper_foundation_test.go`

文档新增本阶段、接口矩阵、验证摘要及日志；更新后端索引并追加固定清单。既有固定计划、需求、设计、契约和证据保持原字节。

B03–B09仍未交付：帖子／评论／昵称／胶囊service与repository、HTTP、限频、审核回调及危机处理、匿名黑名单切换、隐私清理及恢复重删、worker与模块装配、三端联调均需后续完成。正式标签和援助资料、文本安全／脱敏、关怀和全版本删除资源仍按原依赖分别管理；不阻塞本次数据基础，但阻塞对应业务启用和真实验收。所有WI联合用例仍未计为通过。

下一步从B03的配置／偏好初始化、加密用途与公共／本人投影边界入手，并持续保留B04／B07的启用前置。Git提交／推送、部署和上线未执行。

本次验证后仅停止所创建的隔离项目容器及临时PG；集成持久卷保留，未执行force、prune或删除卷。
