# 注销、隐私屏障、普通清理与证据删除

## 任务、授权与基点

【任务】T031，只实施后端；关联REQ-004、REQ-005、REQ-007、REQ-008、REQ-014、REQ-017、REQ-018、REQ-019，重点验收004-F/005-E/007-E/008-D/018-A–F及019-A/B。用户确认T030为前端任务后，明确本轮开始T031、整体实现后集中测试修复与同步文档，源码和文档分别落在develop/backend-develop；不扩展两端页面、推送或生产部署。

【基点】源码`develop`：`eb858e2d3c09cab4269d428eb9e5c45fce79a129`；docs `backend-develop`：`0a6faf4db82c13d358b73b951ca251b78fa53bdb`，开始时工作区均干净。源码精确提交`3aa2ecf2480386a94552efe6abbc3479da91e479`，已提交到develop且源码工作区干净；本记录随docs提交到backend-develop，docs自身提交以Git历史定位。依据已批准方案B、需求基线10.4六行矩阵、design/api/database/security及共享契约0.2.0/revision 5。不改既有固定需求、设计、契约、阶段或共享进度台账，不签发人工审批。

## 接口与装配

| 路由（前缀/api/v1） | 当前后端行为 |
| --- | --- |
| POST /me/deletion-requests | 本人有效学生会话，含禁言/封禁；Idempotency-Key、confirmation=delete_account、账号expected_version；独立意图成功且注销事务提交后202，返回deletion_receipt及processing。会话已撤销，不能用已失效会话重放普通写入 |
| GET /deletion-receipts/{receipt} | 专用高熵认证句柄；无身份、正文、案件或对象引用，只返回processing/completed及安全retryable_error；伪造、裸UUID、过期404；响应no-store/no-referrer |
| DELETE /admin/evidence/{id} | 当前超管；证据范围ID或该范围证据项ID、reason及证据范围expected_version；独立意图先持久，范围转deletion_pending后202，返回持久工作id/version/pending；不立即声称已清除 |
| GET /admin/evidence-deletion-jobs/{id} | 本端新增辅助进度入口，当前超管；只返回processing/completed及安全错误码，不暴露目标或理由；过期404 |

【契约边界】三个主入口沿用固定共享输入输出；EvidenceView.version明确来自证据范围自身版本，危机处置版本仍来自危机案件，两者不能混用。辅助进度入口及本人心愿的peer_deleted通用提示在本端记录，尚未发布共享新revision，不覆盖冻结OpenAPI。peer_deleted不携原应愿人ID或身份；两端接入时需核对增量。注销回执由随机作业标识加独立用途HMAC组成，不把可枚举UUID当作读取凭证；默认宿主保留7天，过期不停止清理。

`studentapi.Dependencies.PrivacyDB/EvidenceDeletionDB/DeletionJournal/Eraser`及`Config.Privacy/EvidenceDeletion`显式启用，不复用学生身份、普通业务、普通审核或危机读取池。缺少独立日志、独立池或用途密钥拒绝装配；未启用时不提示注销动作。独立Journal接口与PostgresJournal实现不拥有池，NewJournal拒绝业务库布局和外部事务；writer/reader分别使用恢复专用身份，日志信封加密绑定恢复用途及意图ID。

开发凭据文件可选PrivacyDSN、EvidenceDeletionDSN、EvidencePurgerDSN、RecoveryWriterDSN、RecoveryReaderDSN及独立RecoveryWrapKey；Load校验与已有各用途密钥不复用。开发初始化不创建这些身份、独立日志资源或替换旧密钥。make build新增privacy-worker；显式APP_ENVIRONMENT=integration、APP_DEVAPPFILE及APP_PRIVACY_SCOPE=account/evidence启动，取消后等待在途操作再释放资源。此开发入口没有正式外部全版本清理/脱敏供应商，待办失败关闭；生产宿主必须显式注入实际Eraser、Redactor、密钥与独立Journal后调用Service.Run，不能使用本地开发密钥适配器。

## 生效、清理与恢复

【实现】统一命令框架新增只供删除使用的PersistIntent阶段：当前会话/角色、锁集合、幂等及期望版本复核后，先在独立恢复资源提交最小技术意图，再改变业务库。普通Apply仍不发送外部请求。日志故障不能返回受理成功；独立提交后业务事务失败或确认丢失，日志消费者重新施加注销/删除，不撤销已持久意图。业务事务成功才返回202；未成功受理的调用不能被写成客户端已经注销成功。

账号注销遵循身份全局锁→后台/学生主体→统一业务资源锁序；发现历史及当前关联，锁后重发现变化则整单重试。同事务递增auth_epoch/version、撤销会话、取消认证/申请/消息/审核及旧工作，终结原匹配与写权限。许愿人所有内容即刻不可读取；应愿人相关存活方心愿及故事在稳定内容ID上建立独立递增privacy_hold，清除公开投影和标签，旧审核作废，关系清理不能解除屏障。公开故事、详情、作者主页、分享与心愿公开投影继续使用同一屏障检查；作者本人只见隐私重审标志、当前版本和允许动作，不返回被屏蔽旧原稿。

| 注销方及原状态 | 生效及清理结果 |
| --- | --- |
| 许愿人：matching/realized/fulfilled | 本人心愿/故事、全部申请匹配关联及双方普通聊天清理；存活应愿人没有孤立可操作心愿，不占活跃额度；旧分享不可读 |
| 应愿人：matching/realized | 原当前匹配结束，许愿人心愿已撤下，不经matching及B01额度检查，原期限不刷新；清理生成脱敏新稿但保持已撤下，由作者显式送审，批准仅到ready，仍需本人显式上架并检查期限/额度/限制 |
| 应愿人：fulfilled | 许愿人自有心愿与故事保留，保持fulfilled，不重新招募；删除原应愿人申请、普通匹配和双方聊天，移除故事source_match_id/peer_epoch；公开须相应新版本及屏障代次审批 |

清理适配器先持久禁止目标及对象迟到写入，等待在途写入退出，再确认全部在线对象版本、回收站及应用缓存清除。单次对象Delete不能满足Eraser约定。调用在数据库事务外、有明确超时；缺失、panic、取消或失败保持processing，保留重试所需加密对象定位，不先删元数据。恢复备份由独立日志重删，不声称注销时抹除全部备份。

幸存内容由显式Redactor在事务外清理个人及组合信息，不向其传注销者身份；无法确认时保持processing。锁后版本变化则丢弃候选重试。成功时替换旧私有版本中的可识别引用、清理旧扫描候选和理由，生成等待作者显式重提的脱敏新版本，不自动创建审核工作或公开；作者提交后仍强制普通扫描和人工复核；不把脱敏供应商输出当作公开批准。父心愿和故事各自复核，父屏障未解除时故事保持持久待处理，不消耗失败重试或取消新稿；故事审批不能释放父屏障。作者可在屏障下替换原稿重提，公开和交互仍拒绝，旧版本/旧代次不能解锁。

历史应愿人注销时，如心愿已经与其他存活应愿人形成新匹配，仅清除旧关系并屏蔽/修订可能关联身份的内容，不终结新匹配或重新分配额度；对应隐私重审保留当前matching/realized/fulfilled状态，不借改稿刷新期限。

普通清理按外键顺序移除双方消息/会话、删除者申请匹配、本人心愿故事/普通内容、学生卡暂存和对象元数据、通知及第三方通知目标、普通访问审计、命令/消费回执和工作。仍存活账号的处罚不因他人注销被撤销，只清除已不存在的普通内容引用。账号物理删除最后执行，级联释放身份密文/检索唯一占用；本次回执先清subject_ref，全部完成清空target_ref。合法证据不依赖普通账号外键，限定原文、学号和必要时间线继续按案件权限访问；不把其他学生卡或普通聊天扩大为永久证据，也不新增普通违规证据创建能力。

数据库清理完成先进入verifying，独立日志确认后才completed并清空目标；两库之间崩溃由verifying继续。未完成工作持久next_at/attempts及安全错误码，调度串行有界批次并推进日志分页，旧待办不阻塞超过百条的新意图；并发处理依赖稳定意图ID的外部幂等，最终锁后不复活终态。过期匿名回执不影响未完清理。

超管删除证据先阻断读取并取消待发关怀/人员通知；独立清除证据正文、学号、资产、动作、案件及投递，不解除尚存普通内容的危机限制。受理理由加密写在待删证据域，随同范围删除；恢复日志不复制理由或浏览轨迹。角色撤销后不能重放；待删范围新键不能再次受理，已有幂等键只解析当前授权结果。

恢复调度使用Recover/AllIntents扫描全部独立意图，包含已确认删除，不能只读pending或相信旧业务快照中的completed。重新建立屏障和清理工作后仍须完成外部清理、取消旧任务、缓存/会话核验及全副本核验。模块不开放网络、恢复消费者外发或自动签发放行；独立日志保留期清理须由已核实副本/消息窗口及恢复演练决定，未实现任意按日期清除日志的捷径。

## 迁移与权限

新增0019，不修改已交付迁移。扩展deletion_jobs的scope/target_ref/expires_at/next_at/attempts，新增证据范围version、心愿peer_deleted、审核任务privacy_recheck及待办索引；新字段均有中文数据库COMMENT与实体映射。存在新隐私数据时下行拒绝丢失数据。升级需停止旧进程，以专用迁移身份显式应用，再由数据库管理员重放bootstrap权限；普通API/worker启动不执行DDL。

普通隐私池仅使用liyuanci_privacy_maintenance，仍无证据schema权限；证据受理新增liyuanci_evidence_delete_api，限定当前后台会话、角色、证据范围、必要动作写入和证据工作，不得DELETE证据。物理清理使用liyuanci_evidence_purger，不获得学生身份或普通业务清除权。deletion_jobs启用范围RLS，账号与证据工作分开；普通liyuanci_api无该表或物理删除权限。恢复writer仅插入/读取及更新确认时刻，reader仅读取，不获得业务或日志清除权限。运行身份不授DDL。

集成Compose新增独立recovery-postgres容器与独立卷，避免把不同schema/逻辑库冒充恢复独立持久资源。两容器仍在同一宿主，不能证明正式故障域/备份隔离；本轮不使用现有日常或生产数据库。

## 验证、取舍与未完成范围

【实际检查】整体实现后集中测试和修复，最终结果如下。

- make fmt、make check通过；check为只读格式校验、go vet ./...、go test -race -cover ./...。普通检查未配置真实DSN时跳过的集成测试不作为真实通过，另由隔离Docker执行。
- make build九个进程全部通过，包括privacy-worker；无依赖变化，无需go mod tidy。
- python3 -m unittest discover -s scripts -p 'test_*.py' -v：32项通过。
- 最终make integration退出0，真实业务PostgreSQL、独立日志PostgreSQL、Redis、RocketMQ、HTTP和受限数据库角色往返；既有可靠工作、学生卡、心愿、审核、应愿匹配、聊天、故事、安全治理与危机回归通过。TestPrivacyDeletion共17组通过，包含六行矩阵、历史应愿人删除不终结新匹配、清理暂停/失败、独立确认失败重试、角色撤销与同键重放、普通注销后证据独立可读、有效来源删证据仍隔离、受罚本人及资产/普通审计/第三方通知清理、缺适配器不提前完成、并发注销、旧工作晚到、作者显式重提、父审批等待不阻塞普通扫描、回执严格输入/过期及105条意图分页。
- 额外独立运行migration测试二进制：TestBusinessSchema、TestRecoverySchema、TestInvalidDependencies、TestPostgresMigrations均通过，覆盖升级至19、空库上下行、非空拒绝回退、并发迁移、对象注释和权限/误授权清除。恢复用例在独立集群显式创建仅测试使用的合成业务组，不要求真实日志服务器部署业务身份。
- 新单测验证回执篡改/截断/跨用途、输入先行拒绝、外部清理panic/取消及独立应用装配。两仓库git diff --check通过；docs文档链接及固定指纹在登记本轮记录后复核。

集中修复包括注销取消工作SQL、证据动作RETURNING的最小列级读取权限、独立确认与verifying重试、隐私新稿不能自动送审、历史应愿人删除不能终结新匹配、父屏障等待不能占据其他扫描的唯一候选位，以及下行时先清除范围RLS依赖。既有故事屏障回归更新为新隐私稿须人工确认后恢复公开，不把机器扫描完成当作新稿批准；这是对已知身份风险的保守复核实现。旧恢复测试夹具原来默认与业务同集群，补齐独立集群所需合成角色后重验通过。没有修改已交付迁移或账本；本轮未交付的0019完善后，测试重新创建专用库验收，旧测试库和卷保留。

恢复场景在真实独立日志上保留已确认记录，再模拟业务旧快照还原普通主体/证据，实际调用Recover重建清理并删除；不是完整PG/对象备份恢复演练。身份、密钥、内容分析、对象全版本清理、组合信息脱敏及运营资料均为合成夹具；独立容器/卷也不证明正式物理故障域、外部对象副本或90天策略。没有真实用户或生产资源参与。

源码变更共41个文件，覆盖internal/privacy、HTTP/应用/worker装配、命令框架、实体、0019及权限、心愿/故事重审、Docker/Make入口和对应测试。完整变更文件/指纹及检查见[验证清单](../validation/2026-10-23-privacy-deletion-r1.json)，原始公开证据见[全量集成](../validation/2026-10-23-privacy-deletion-integration.txt)、[质量构建与入口](../validation/2026-10-23-privacy-deletion-quality.txt)、[完整迁移](../validation/2026-10-23-privacy-deletion-migration.txt)。私有调试日志不登记为新阶段。

本轮隔离项目容器和网络已移除，四个数据卷及原凭据保留，见[标签核对与清理](../validation/2026-10-23-privacy-deletion-cleanup.json)。没有删除卷、force/prune或操作其他日常项目；不推送、不合入main、不部署生产。

【未完成/外部依赖】D05正式独立故障域、真实执行身份/密钥服务、在线对象全版本与缓存清理适配、脱敏供应商、PG备份/WAL/对象历史/复制导出/MQ重放的完整清单、90天生命周期、恢复网络隔离与人工放行演练仍须真实资源交付及T033/T035验收。代码可注入完整能力并在隔离测试验证协议，但开发入口未配置这些供应商，不能对真实用户声称全部物理删除或恢复验收完成。日志的到期清除没有全副本窗口证据时不得执行；本轮不签发上线/删除日志放行。T030/T032两端界面、实机微信、正式援助资料和生产部署不在范围。
