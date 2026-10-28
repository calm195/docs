# 树洞正式进程与依赖装配阶段记录

日期：2026-10-28（Asia/Shanghai）。状态：正式进程与依赖装配及隔离演练完成，生产关闭。
任务：B08；需求：REQ-009、REQ-010、REQ-011、REQ-014、REQ-015、REQ-017、REQ-018、REQ-019、REQ-020。
契约：whispers/1.0.0，固定契约及已批准产品语义不变。

## 基点与范围

后端 develop 基点 `8c2372edcb99abbe080352e4d1ade3e803e07e1b`；docs backend-develop 基点 `d0cc313c473a683e9bb59c4b4457bdf0cb8da832`；开始时两工作区干净。沿用 docs 独立工作树，既有406项固定文件不变。前序：[匿名兼容与隐私恢复](2026-10-28-whispers-privacy-r1.md)。源码按依赖顺序提交：`1251fe75e1ba051ef79cb372765762c5cc3fbca0` → `4f8a9124afd5a04b314d434f6161078d50503a11` → `8f0e0f20a1de27872afc62bd2cec1130c15c1986` → `281430b6b05aafd5db0f315285f5999f690a645d`。

## 实施范围

正式入口通过外部 APP_WHISPERSFILE 显式选择，基础健康模式及既有开发入口保持原有边界。API 注册完整树洞能力，内容进程分开调度审核、胶囊解锁和危机投递，隐私进程先回放包含已确认项的独立日志再重删。普通启动不运行DDL、不发布词库或创建MQ主题，不生成凭据或历史密钥。

供应商通过有界TLS协议显式适配，业务与恢复KMS用途隔离，公共脱敏与胶囊仅分类分开，外部清理必须确认写屏障与完成，通知按投递ID去重。资料从版本化外部文件读取；缺字典保持半匿名不可用，缺援助资料不编造公众联系方式。

启用前检查迁移目录、SQL最小身份、三类已发布词库、opaque切换及独立恢复日志。读取／外发进程冷启动发现任一删除目标仍在业务快照内即拒绝启动，先由专用隐私进程恢复并重删。此策略也阻止未清理完的普通删除在冷启动后绕过保护，采用可用性取舍换取失败关闭。

生产启用请求被拒绝，生产保持关闭。API复用已有数据库会话，不新增模板用户、模拟登录或业务Mock路由。旧身份服务应使用同版本Me动作投影；宿主其余认证、对象和业务依赖的就绪责任保持在所属模块。

## 验证与边界

相关包、make fmt、全量make check（vet／race／coverage）、make build、35项入口测试通过；实际原生进程演练及完整Docker集成19项顶层用例通过。最终MQ发送与消费确认断言追加后，复跑相关包、原生进程和镜像MQ专项通过。外部供应商、KMS及清理的测试替身会明确标注，不作为真实供应商或生产灾备验收。B09容量、三端交接及外部服务验收仍待后续；本阶段不推送、合并、部署或启用生产。


## 文件与启动顺序

完整26文件及指纹见[验证清单](../validation/2026-10-28-whispers-runtime-r1.json)，主要范围：

- `internal/config/whispers.go`负责严格JSON运行配置与版本化资源文件加载；`internal/platform/runtime_database.go`负责运行数据库客户端创建与身份校验。`internal/whisperapp`负责TLS网关、KMS允许引用及用途分离、版本化资料、运行池、API装配、独立审核／解锁调度及恢复门禁，附单测和真实进程集成。
- `cmd/server`、`content-worker`、`privacy-worker` 与 `internal/config`：显式正式入口、启动诊断、生产开启拒绝、资源关闭顺序；原有开发模式及基础健康入口保留。
- `internal/moderation`：正式关怀资料校验，树洞维护调度与新旧危机来源隔离；`internal/privacy/cleanup.go`：恢复重建的下一调度时间使用数据库时钟。
- 三个 `configs/examples/whispers-*` 文件：无可用凭据的默认关闭模板；根README维护配置、供应商边界、启停和恢复要求。
- Dockerfile、Makefile、集成Compose：构建三个实际入口与集成测试二进制，显式建立独立树洞审核／解锁topic，常规integration持续覆盖正式进程。

本次没有新增迁移或修改历史SQL，要求已有0026及permissions。部署二进制不改变数据库策略或启用模块。两端匿名兼容升级、opaque切换、正式词库和已核验资源须在开启隔离演练前准备；生产开启请求仍拒绝。

API使用五个独立业务角色池和独立恢复读写池；内容入口使用domain-worker，隐私入口按account／evidence使用privacy-maintenance／evidence-purger。LOGIN须只归属预期权限组且无DDL／superuser／绕过RLS权限。API通过后台权限池核对三类已发布词库，不向普通API额外放权。

配置以外部路径提供，JSON期限为纳秒、密钥为32字节Base64，各用途互不复用。MQ两个通道不得共用topic／producer／consumer group；仅integration可显式轮询或无鉴权。运维先建立topic，再启动内容进程；API只写持久outbox，worker分别转发与补偿。模块关闭仍保留opaque保护和已持久安全工作。Care、令牌及历史密钥引用变更后重启相关进程，公众Catalog读取当前文件版本；不重新生成或替换历史密钥。

## 供应商与恢复取舍

网关为本端显式私有适配协议，使用经CA校验的HTTPS、独立令牌文件、固定ProviderVersion和能力声明，不修改共享Wire。每个调用有context和响应上限，不跟随重定向、不透传供应商错误。启动时分别执行业务及恢复KMS随机探针；当前引用用于wrap，历史unwrap只能命中明确允许的引用。公开分析与胶囊仅分类接口分离，返回私密替换正文直接拒绝。erase必须确认写屏障与完成，notify携稳定DeliveryID和CaseID且由供应商去重；不声称提供真实外部供应商实现。

读取／外发冷启动扫描全部独立日志，发现仍存在的目标即失败。隐私进程先Recover包含已确认项的全部意图，再常驻处理或以APP_PRIVACY_RECOVER=true有界恢复；仍有未完成待办不能成功退出。此严格门禁也影响普通清理中断后的冷启动，是本次明确的失败关闭与可用性取舍。恢复网络开放仍需运维隔离顺序，应用检查不代替全副本和90天备份验收。

实际进程演练发现恢复重建next_at用宿主时钟会使立即处理被数据库时钟挡住，现改用clock_timestamp()；反复恢复仍保留独立意图和现有屏障，不删除日志绕过门禁。

## 实际验证与证据

| 检查 | 结果 |
| --- | --- |
| 相关包／格式／全量质量 | [相关包](../validation/2026-10-28-whispers-runtime-check-fast-r1.txt)、[格式](../validation/2026-10-28-whispers-runtime-fmt-r1.txt)、[check](../validation/2026-10-28-whispers-runtime-check-r1.txt)通过 |
| 构建／入口 | [make build](../validation/2026-10-28-whispers-runtime-build-r1.txt)、[35项入口回归](../validation/2026-10-28-whispers-runtime-entry-tests-r1.txt)通过 |
| 真实原生进程 | [PG／Redis＋实际二进制](../validation/2026-10-28-whispers-runtime-postgres-processes-r1.txt)通过，显式无MQ轮询；公私稿、停机补偿、依赖故障、禁用及两次恢复门禁 |
| 完整中间件 | [make integration](../validation/2026-10-28-whispers-runtime-integration-r1.txt)19项顶层用例通过，含正式MQ=true进程演练及旧模块 |
| 最终MQ补测 | [最终镜像发送和消费确认](../validation/2026-10-28-whispers-runtime-mq-final-r1.txt)、[相关包复跑](../validation/2026-10-28-whispers-runtime-final-related-check-r1.txt)通过 |
| 基础模式 | [实际无外部依赖server](../validation/2026-10-28-whispers-runtime-foundation-r1.txt)：health200、ready503、新业务及Me404、SIGTERM退出0 |
| 契约与覆盖 | [固定契约检查](../validation/2026-10-28-whispers-runtime-contract-r1.txt)通过；[50操作注册／累计隔离状态](../validation/2026-10-28-whispers-runtime-operations-r1.json)，不表示本阶段重跑每项Wire或三端联合验收 |
| 文档治理 | [文档与固定指纹](../validation/2026-10-28-whispers-runtime-doc-check-r1.txt)，原406项保持不变 |

真实依赖为Docker PG、实际受限LOGIN与权限、Redis、RocketMQ、TLS和三个二进制，测试没有用SET ROLE伪装运行登录。网关／KMS／分类／脱敏／清理和通知均为隔离合成；援助资料和验证账号是fixture，不是真实资料或用户。专项恢复日志为独立逻辑库，完整既有隐私回归另覆盖独立恢复PG容器；不把这当作生产物理故障域证明。最终停止本任务隔离容器和专用Redis，所有既有数据卷保留。

生产保持关闭。B09容量、三端真实联调、真实供应商通知和灾备验收仍未执行；当前源码和本端通过不等于上线批准。


## 收尾工程归位与补验

收尾审查按仓库规范将运行配置、版本化资源文件加载移入internal/config，所有新增文件读取入口以context为首参；PostgreSQL运行池创建移入internal/platform，装配包只登记关闭责任。作为第四笔依赖整理提交，前三笔功能提交保留。此整理没有新增业务语义、迁移、配置开关或供应商能力。

归位后再次运行相关包、make fmt、make check、make build及35项入口回归通过；原生三个实际进程、基础健康模式和最终Docker MQ发送／消费确认用例再次通过，证据已替换为本任务最终结果。完整19项集成是此前同一业务实现的通过结果，收尾只复跑受影响正式装配及全量离线质量，未重复宣称三端或生产验收。
