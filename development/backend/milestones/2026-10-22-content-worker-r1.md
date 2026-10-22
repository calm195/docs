# 内容常驻工作进程阶段记录 r1

日期：2026-10-22（Asia/Shanghai）。任务T016运行装配收口，关联REQ-008、REQ-015、REQ-017、REQ-018、REQ-019、REQ-020，复用T007持久工作与已有心愿扫描核心。不签发G1/G2/G3，不将本端合成验证作为产品或生产验收。

## 输入、分支及授权

- 后端起点为干净main，完整HEAD `a953d17e4d21c9d72836ddffdba8f3e2b70c93a6`；docs起点为干净main，完整HEAD `8d89c273afe462a8a589557724af3ae1f988678a`。fetch后两仓库main均与origin/main一致。
- 用户明确要求后端`develop`、文档`backend-develop`，覆盖默认同名codex分支约定；两分支从上述基点新建。用户授权按任务完成开发、测试验证、修复、提交、合并推送，默认合入各自已有main；没有部署或上线授权。
- 先完成任务实现，再运行相关包、全量质量与实际集成；先提交后端，再把精确提交写入本记录和证据后提交docs。精确源码提交见本记录交付段。
- 正式契约保持0.2.0及静态动作revision 5，不修改固定需求、设计、审批、旧阶段和共享台账。延续既有B05精确registry.id及B06完整词库快照决策。

## 实现与验收范围

1. 新增独立`cmd/content-worker`开发进程和`devapp.RunContentWorker`。仅接受integration环境，复用已有受限WorkerDSN和历史加密密钥，不使用迁移管理员连接，不执行DDL、词库发布、主题初始化或凭据替换。
2. 默认只轮询数据库，未配置分析供应商时返回失败，保持待审并依持久工作预算重试/异常待办。仅显式synthetic模式返回固定合成正文并清空身份标签；仍对原始正文执行三类词库命中，不构造生产隐私检测能力。
3. 提取`internal/workrunner`共用消息发送、订阅、有界轮询与关闭生命周期，学生卡通过适配保持原接口。两个领域仍使用独立路由、主题及组；MQ模式并行运行发件箱转发与数据库补偿，消息配置缺失不要求Broker。
4. 关闭时取消并等待在途消费及轮询，再释放生产者和外层数据库池；并发Close幂等。单轮失败、panic和超时保留脱敏完成日志并等待下一轮，不形成热循环。运行日志不记录正文、密钥、DSN或供应商原始错误。
5. 修复`moderation.ProcessNext`把数据库候选查询预算传播到整个分析流程的问题：查询用独立有界context，后续Consume继承调用方总预算。真实慢分析用例证明超过单次数据库预算的合法分析可完成；总操作与MQ处理预算至少20秒。
6. 宿主入口新增`dev-content-worker`及`dev-native-content-worker`，配置通过所选operations.env派生，不接受终端遗留APP覆盖。stop跟踪独立PID与路径，只停止所选配置的三个应用，保留中间件/卷；原生无MQ不要求Docker。Makefile和Dockerfile构建新进程，CI既有make integration覆盖新增运行用例。

## 配置、恢复及风险

- 直接进程：`APP_ENVIRONMENT=integration`、`APP_DEVAPPFILE`；可选`APP_CONTENT_ANALYZER=synthetic`和`APP_CONTENT_MQFILE`。默认/显式unavailable都不会自动通过内容。
- 宿主operations.env：可选`LIYUANCI_LOCAL_CONTENT_ANALYZER`、`LIYUANCI_LOCAL_CONTENT_MQ_FILE`，文件放对应.local或显式外部位置。MQ模板为源码`configs/examples/content-worker-mq.yaml`，事件`wish.review_requested`，主题`liyuanci_content_review_v1`须先在所选Broker显式建立。
- 无新增迁移、依赖或密钥。已有库仍须由显式迁移入口具备0013结构，运行启动只核对结构。未在用户日常环境初始化、启停业务或改写凭据。
- 缺供应商的进程会消耗持久重试预算，最终attention任务须经已有显式恢复流程处理；普通重启不重置历史任务。合成模式会丢弃原始正文和标签，只适合隔离技术验证。
- 正式词库/样例和真实分析供应商仍待交付。application/message/story扫描、完整危机事件/关怀、隐私清理、跨端联调、性能和生产验收均未完成；不整体关闭B11/B13等共享阻塞。

## 实际验证及证据

- `make fmt`、相关包`make check-fast`、最终`make check`（只读格式、go vet、race及覆盖率）和`make build`全部通过；构建包含新增内容进程共八个制品。首轮沙箱无法访问Go缓存，经授权的提权执行通过，不计初次环境失败为测试通过。
- `python3 -m unittest discover -s scripts -p 'test_*.py' -v`共32项通过，覆盖内容进程配置派生和停止归属保护。
- 独立项目`liyuanci-content-worker-cc09466d`的`make integration`两轮退出0。最终轮包含真实受限身份的内容二进制数据库/MQ两模式启动及SIGTERM正常退出；既有学生卡消息进程回归通过。新增慢分析、常驻补偿关闭/重启及真实MQ转发/订阅用例通过，原内容核心、NACK重投、迁移上下行、权限/对象注释及中间件探针也通过。真实供应商与规则仍为合成，不宣称生产验收。
- 测试项目容器与网络已移除，所有卷和忽略目录内原测试凭据保留；用户日常PG/Redis未启停。未部署应用。
- 两仓库`git diff --check`通过；docs文档链接、固定指纹及迁移映射检查通过，新增登记后再检查。远端CI尚无本轮结果。

精确源码提交：`99a887ca84f2f6d79cb092fd97da6819ed325a57`，提交说明`feat(worker): add content review process and recovery scheduling`。用户授权的提交、合并与推送由本轮执行；本记录在docs提交时固定，docs提交本身及远端结果以Git历史为准，避免自引用提交SHA。

证据：[集成完整输出](../validation/2026-10-22-content-worker-integration.txt)、[交付验证清单](../validation/2026-10-22-content-worker-r1.json)。此前核心边界见[内容审核核心阶段](2026-10-22-content-moderation-r1.md)，其固定指纹保持不变。

## 主要文件及后续

- 进程/装配：`cmd/content-worker/main.go`、`internal/devapp/content_worker.go`及测试。
- 调度/修复：`internal/workrunner/worker.go`及测试、学生卡适配及测试、`internal/moderation/worker.go`。
- 验证：`internal/moderation/integration_test.go`、`internal/studentcard/message_chain_test.go`、配置及宿主脚本单测。
- 配置/构建/用法：`configs/examples/content-worker-mq.yaml`、`Makefile`、`Dockerfile`、`deploy/compose/integration.yaml`、`scripts/dev.py`、`scripts/localdev.py`、根README。
- docs：本记录、验证清单和完整输出、端内索引、当前宿主开发说明、固定清单。精确变更路径和SHA-256见验证清单。

下一开发任务为T019应愿申请、唯一匹配及普通回退/B01，必须完整实现后再测试、修复和提交合并，不以本阶段记录冒充其完成。
