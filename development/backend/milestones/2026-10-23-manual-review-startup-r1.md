# 原文人工审核与本地开发服务启动

## 来源与状态

用户于2026-10-23要求启动后端及数据库管理工具，沿用已填微信配置，并让内容保留原文交管理端人工审核。关联既有REQ-015、REQ-018、REQ-020；本次为隔离开发接入，不新增生产审核策略或业务REQ。共享正式契约0.2.0，接口语义不变。

源码分支develop，完整HEAD基点`3aa2ecf2480386a94552efe6abbc3479da91e479`；本次源码未提交，文件指纹见验证证据。docs分支backend-develop，基点`3d1d1f395128d8bb0d1a1bc692b04095eea3f12e`。未获提交、推送、合并或生产部署授权。

## 实现与取舍

新增显式manual开发分析模式，心愿、应愿留言、私聊、还愿故事保留原文，心愿保留原身份标签，并强制OrdinaryHit进入人工复核。没有自动隐私识别或脱敏；人工批准后仍使用原文候选，应由审核员核验，心愿不自动上架。三类词库先决条件、危机优先隔离、当前资格复核、版本与幂等机制保持。默认不可用、synthetic替换正文及生产拒绝开发入口的行为保留。增加取消、标签、私聊及生产隔离测试。

启动时发现普通运行池对`evidence.crisis_deliveries`调用to_regclass，会因无证据模式USAGE而失败。改为pg_class/pg_namespace目录检查，不增加普通身份的证据权限。以四个真实受限身份验证目录检查成功且仍无证据模式USAGE。没有修改SQL迁移文件或扩大数据库角色。

## 本机运行操作

使用既有liyuanci-local项目和数据卷。只将.local/dev/business.json中已填写的微信两个字段复制到.local/local/business.json，不复制其他环境的账号、DSN或密钥。显式运行dev-init应用既有迁移至0019、重放权限并补齐ModerationKey，原登录名developer与已有口令、历史密钥保持。首次初始化最后阶段因上述权限问题失败，修复后重跑成功；首次受沙箱Go缓存读取限制的make check失败，获准使用宿主缓存后完整检查成功。

原三类词库均无生效版本，经真实后台登录及正式词库API显式创建并发布三个空开发快照，供全部转人工联调，不冒充正式安全规则。没有创建模拟学生或Mock路由，没有自动复活attention历史任务。当前空规则没有真实危机识别能力。

PostgreSQL、Redis、pgAdmin、Redis Insight已启动；API、card-worker、content-worker在宿主后台运行，日志位于忽略目录.local/local/logs，使用dev-stop停止应用，dev-infra-stop停止本项目基础设施，均保留数据。API18080、PG15432、Redis16379、pgAdmin15050、Redis Insight15540均仅本机访问。pgAdmin已新增“鲤源池本地业务库”连接，口令未导入，首次连接从本地postgres-password文件输入。旧liyuanci-dev与原生资源未启动或清理。

## 实际验证与未完成边界

- make fmt、make check（格式只读校验、vet、race/cover）、make build通过。
- APP_DEVAPP_TEST_FILE指定本地派生配置，make check-fast PACKAGES=./internal/devapp/...通过，四个普通池无证据域权限的回归通过。
- 入口离线单测32项通过；make dev-doctor通过。
- 真实本机HTTP：healthz200、匿名wishes200、未登录me401、readyz503；后台登录及人工审核列表均200，当时队列为空。pgAdmin和Redis Insight均200，pgAdmin账号登录及认证页面验证通过，导入一组一连接成功。
- 独立临时Docker项目liyuanci-manual-check-7a06ed11运行go test ./internal/moderation -run ^TestModerationCore$ -v -count=1 -timeout 180s通过（17项子用例），验证真实PG权限、人工复核、危机隔离、事务回滚与补偿。未配置MQ，测试末尾既有通用日志中的MQ通过不能作为本次证据。测试后仅停止本次PG容器，保留卷与私有凭据。
- 本次未运行完整make integration；未测试真实微信code交换、手机真机HTTPS、真实安全供应商或实际新学生内容的跨端审核。微信仅确认配置完整并成功装配，不宣称实机登录通过。

[启动检查与源码指纹](../validation/2026-10-23-manual-review-startup-r1.json)、[独立PG检查日志](../validation/2026-10-23-manual-review-pg-r1.txt)。
