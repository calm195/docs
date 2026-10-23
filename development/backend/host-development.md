# 本地开发与配置入口

当前开发方式包含原生PG/Redis与Docker PG/Redis两种，Go API和业务card-worker均运行在宿主；完整Docker用于隔离集成。关联REQ-018/020工程范围，不改变业务契约或生产验收结论。

## 目录约定

- 公共应用覆盖项在`configs/app/`；基础默认值由Go配置加载器维护，不再保留完全重复的基础YAML。
- 中间件配置在`configs/middleware/`，监控公共文件在`configs/observability/`，环境模板在`configs/examples/`。
- Compose统一在`deploy/compose/`；`mq.yaml`提供共用定义，`mq-host.yaml`覆盖宿主公布地址和loopback端口，集成及原生模式不再各复制一套MQ服务。生产ACL配置仍独立。
- scripts仅保留开发/运维入口、初始化与共享模块，离线单元测试在scripts/tests。专项验收脚本按用户要求删除，CI保留全量Go检查、入口单测及Make直接声明的集成往返。
- 凭据、密钥、对象和进程状态统一在仓库`.local/<模式>/`，Git和Docker构建上下文均忽略。目录0700，环境文件只按字面解析。源码目录禁止存实际凭据；兼容显式旧外部路径。

## 原生PG/Redis

需要Go 1.25+、Python 3.9+、本地psql；PG/Redis由使用者预先启动，入口不安装、启停或重置原生服务。

```sh
make dev-native-init
make dev-native-infra
make dev-native-doctor
make dev-native-api     # 终端一
make dev-native-worker  # 终端二
make dev-native-stop
# 可选MQ
make dev-native-mq
make dev-native-infra-stop
```

默认配置`.local/native/operations.env`，项目`liyuanci-local-native`，PG5432、Redis6379、API18080，连接127.0.0.1。首次初始化默认用当前宿主用户名连接PG管理员，需建库/建角色权限；显式迁移及授予权限后，运行身份保持受限。模板见[原生环境示例](../../../liyuanci-backend-go/configs/examples/native.env)。

原生模式通过`LIYUANCI_NATIVE_PG_USER`选择管理员，`LIYUANCI_NATIVE_PG_PASSWORD_FILE`及`LIYUANCI_NATIVE_REDIS_PASSWORD_FILE`引用私有口令文件，路径相对operations.env解析；Redis当前支持默认ACL用户。无需口令时省略对应项。管理员连接环境不传给日常API/worker。

infra只检查本地端口；doctor验证实际数据库身份、关键结构、Redis认证及共享目录，不监听HTTP、不消费任务、不执行DDL。无MQ时完全不需要Docker。MQ模式只运行NameServer/Broker及退出后的一次性卷权限助手；普通infra-stop只停本入口登记过的MQ并保留卷，原生PG/Redis始终不动。

## Docker PG/Redis

使用`make dev-init/infra/doctor/api/worker/stop/infra-stop`，默认配置`.local/local/operations.env`，项目`liyuanci-local`，PG15432、Redis16379、API18080。中间件常驻，修改Go代码只重启对应宿主应用。

`make dev-mq`、`dev-management`、`dev-monitoring`按需启动；组合使用`make dev-infra DEV_ARGS="--mq --management"`。pgAdmin15050、Redis Insight15540、MQ Dashboard18081、Grafana13000。Dashboard与Broker共用网络空间以支持公布的loopback地址；宿主API/worker日志在终端查看，可选监控只采集Docker日志。原生模式拒绝管理/监控参数。

完整Docker入口仍为scripts/init-dev.sh、start.sh、stop.sh，共用services.py，默认配置改为`.local/dev/operations.env`；显式业务初始化为scripts/init-business-dev.py。停止和普通启动仍不迁移、不重置账号、不删除卷。生产必须使用独立`.local/production/`或显式secret文件，模板见[生产配置示例](../../../liyuanci-backend-go/configs/examples/production.env)，本次未部署生产。

## 学生卡消息模式

默认数据库轮询保持可用，无MQ时不构造消息客户端。显式启用步骤：

1. 用对应模式的`make dev-mq`或`make dev-native-mq`启动所选隔离项目的NameServer/Broker。
2. 在所选项目Broker中显式建立`liyuanci_student_card_scan_v1`主题。例如默认Docker宿主项目：`docker exec liyuanci-local-broker-1 sh mqadmin updateTopic -n namesrv:9876 -c DefaultCluster -t liyuanci_student_card_scan_v1`；其他项目须改为实际归属容器，不能操作其他环境。
3. 将[学生卡消息配置模板](../../../liyuanci-backend-go/configs/examples/card-worker-mq.yaml)复制到对应`.local/<模式>/card-worker-mq.yaml`，核对NameServer地址、独立主题/生产组/消费组/实例及预算。该模板仅限隔离开发；不复用探针主题，不自动建主题，不提供生产凭据。
4. 在所选`operations.env`设置`LIYUANCI_LOCAL_CARD_MQ_FILE=/绝对路径/card-worker-mq.yaml`。也可使用相对该环境文件的路径；脚本按字面解析并转换为绝对私有路径。随后运行对应`dev-worker`或`dev-native-worker`。

消息模式由同一业务worker负责发件箱转发、真实订阅和数据库到期补偿。MQ只携带六个技术字段，数据库工作/资格/版本及领域回执是最终依据；收到Deferred的唤醒可确认，但工作须由数据库补偿或异常待办继续处理，不等于扫描完成。扫描和学校规则仍是开发模拟，不冒充真实供应商。

取消时先停止订阅和调度，等待在途处理，再关闭消息生产者，最后释放数据库。普通启动不迁移、不重置账号/工作或生成新口令。配置无效时拒绝启动，不回退到看似成功的数据库模式；去掉该显式配置才恢复默认轮询。doctor仍只检查数据库、身份与目录，不证明MQ主题/权限可用。完整Docker日常开发入口未增加此文件挂载；本次日常消息配置面向宿主/直接二进制，容器真实接线由隔离集成测试验证。

## 内容扫描与人工复核

新增业务迁移0013提供三类词库基准、精确案件扫描快照和独立案件版本。现有环境须先停止所选宿主API/worker，再显式执行该模式的初始化（`make dev-init`或`make dev-native-init`，保持原项目/配置参数），由专用身份应用迁移和权限，并补齐独立用途的`ModerationKey`。初始化只补新用途密钥，已有密钥、口令、WorkerDSN和对象保持；普通启动不执行DDL或生成密钥，缺新结构时拒绝启动。迁移对有审核/词库记录的降级拒绝破坏性回退，升级前先按既有运维流程备份。

提供独立`ModerationKey`时，开发API显式装配正式0.2.0已有的七项普通审核/词库路由：列表、详情、决定以及词库列表、快照详情、创建和发布。默认健康模式不启用，未补用途密钥的旧配置也不隐式开放新路由。普通案件可访问心愿及应愿留言的普通/涉校命中精确版本；危机命中不出现在该队列，原文详情与决定写持久审计，学生令牌不能进入后台。

词库按完整快照创建，以heads.kind.version比较并发基准；发布同时比较草案资源版本、head代次及base_effective_id。发布原子归档旧版，不自动重扫历史；归档只读且不可直接重发。新扫描固定记录当时三类规则版本。正式运营词库和样例仍须D03资料方交付，不能把测试词条当正式内容规范。

`moderation.NewWorker`要求显式注入真实文本安全/个人及组合信息处理器，无默认放行实现。它提供MQ Handler和有界`ProcessNext`数据库补偿；分析在事务外执行且允许纯分类重复调用，最终在统一锁序下复核账号/处罚、任务绑定、内容/限制/屏障代次，原子写结果与稳定操作回执。正常通过只到ready，涉校/普通命中人工复核，危机命中持久隔离；作者仍须主动上架。分析失败保持不公开并按预算重试/待办。

日常card-worker仍只处理学生卡。独立内容进程通过`make dev-content-worker`或`make dev-native-content-worker`前台启动，沿用所选配置的受限WorkerDSN和历史密钥，不要求对象目录或Redis，不执行DDL或初始化词库。`dev-stop`同时等待三个宿主进程退出，始终保留中间件及卷。

内容进程默认没有分析供应商，分析失败保持待审，按持久任务预算重试后转异常待办。仅在隔离开发中，可在operations.env显式设置`LIYUANCI_LOCAL_CONTENT_ANALYZER=synthetic`，对心愿和应愿将结果正文替换为固定合成文本并清空标签；对私聊只产生合成分类并保留原文，私聊仅普通/危机规则参与转人工或隔离，合成模式不代表实际隐私检测。生产拒绝该开发进程。后续供应商到位后，attention任务须经既有显式恢复流程处理，普通重启不重置尝试次数。

默认无MQ，仅有界轮询数据库。消息模式先显式创建`liyuanci_content_review_v1`主题，复制源码`configs/examples/content-worker-mq.yaml`到所选.local目录，设置`LIYUANCI_LOCAL_CONTENT_MQ_FILE`。直接运行对应`APP_CONTENT_MQFILE`和`APP_CONTENT_ANALYZER`。事件为`wish.review_requested`，与学生卡通道隔离；同时运行发件箱转发、订阅及数据库补偿。调度和消息处理预算至少20秒，覆盖查询、分析及最终事务，关闭等待在途操作后才释放池。实际生产供应商仍未交付。危机完整案件/关怀由后续危机领域接入，当前隔离不等于危机处置闭环。`target/allowed_actions`扩展继续未激活，下线/解除限制接口未开放。

## 原文人工审核联调

仅在隔离开发中，在所选`operations.env`设置`LIYUANCI_LOCAL_CONTENT_ANALYZER=manual`，重启内容worker。心愿、应愿留言、私聊和还愿故事的候选保留原文，心愿原身份标签保留，统一标记必须人工复核；没有自动安全分析或隐私脱敏。管理端按既有审核任务列表、详情和决定接口处理，批准后使用原文候选，心愿仍须作者主动上架。三类已发布词库仍为先决条件，危机命中继续隔离且普通审核不可见。新开发环境如缺少词库，应经后台显式创建并发布开发规则；空词库只能表示本地人工联调，不构成真实检测规则。默认模式仍失败关闭，合成模式语义不变，生产拒绝人工开发模式。

## 应愿与匹配

应愿与匹配入口随显式心愿应用装配，升级先显式应用0014并重放bootstrap权限。六项正式接口提供申请、本人/许愿人列表、撤销、同意及普通回退；无需新增密钥或修改内容MQ配置。内容worker使用同一技术主题，依据注册类型区分心愿与应愿留言。默认分析能力仍失败关闭，合成模式不作真实安全验收。完整接口与验证范围见[应愿匹配阶段](milestones/2026-10-22-application-matching-r1.md)。

申请202只代表持久待审，许愿人看不到待审正文；审核后仍须按当前资格、期限和限制复核。回退重新招募时旧会话只读，新匹配另建会话；刷新期限必须重新审核，已实现回到应愿中需有活跃额度。站内通知同事务持久化，真实微信投递与后续通知服务尚未交付。0014已有新协议数据时不允许破坏性降级，采用前向修复或既有恢复流程。

## 旧配置导入与资源归属

首次初始化目标尚不存在时，从`~/.config/liyuanci/<模式>/`复制配置、密钥、口令和对象，重写文件引用，原目录保留。`make dev-import`或`dev-native-import`只执行导入，不连接业务库或重置账号；已有目标绝不覆盖。运行中的旧应用先停止，避免对象目录并发写入；缺失原引用时不发布半成品目标。旧卷或旧库缺原密钥时仍拒绝生成替代值。

`business.json`保存初始化身份与密钥，迁移身份在独立business-migration.json；business.host.json是可重建的宿主派生文件。对象目录属于持久数据，不当作缓存删除。旧容器对象卷不会自动搬迁。

默认端口可用`LIYUANCI_LOCAL_PG_PORT/REDIS_PORT/API_PORT/NAMESRV_PORT`修改；Broker10911/10909固定。不同项目保持同一组`DEV_ARGS="--project liyuanci-local-主题 --env-file /实际路径/operations.env"`，模式/归属不匹配拒绝执行，端口冲突不停止其他项目。

普通停止始终保留数据卷。用户于本次会话另行明确授权全局删除无引用资源：清理时检查所有运行和停止容器的卷/网络引用，保留被引用资源及默认网络，不使用force/prune；该授权不使普通停止命令具有删卷行为。

## IDE与验证

`make dev-config`或`dev-native-config`刷新派生文件。IDE调试cmd/server设置APP_ENVIRONMENT=integration、APP_DEVAPPFILE为实际business.host.json、APP_DATABASE_DRIVER=postgres、APP_DATABASE_DSN=devapp、APP_REDIS_ENABLED=true、APP_REDIS_ADDRESS为实际地址、APP_ROCKETMQ_ENABLED=false、APP_SERVER_ADDRESS为实际loopback地址，参数`-config ""`。需要Redis口令时显式设置APP_REDIS_PASSWORD。cmd/card-worker默认只需APP_ENVIRONMENT、APP_DEVAPPFILE；显式消息模式另设APP_CARD_MQFILE。IDE进程由IDE管理，入口只停止自己记录且可执行路径匹配的PID。

日常相关包检查用`make check-fast PACKAGES=./internal/模块/...`；交付前`make fmt`、`make check`，Go变更另`make build`；离线脚本测试用`python3 -m unittest discover -s scripts -p 'test_*.py' -v`。`make integration`直接声明真实PG/Redis/MQ、显式探针迁移和重复回执往返，并在同一隔离项目执行持久工作/重驱动审计及学生卡消息领域链。该入口会迁移并清理业务测试夹具，只能指向独立测试项目，不使用日常业务库。调用者提供隔离项目和测试口令并负责停止容器/网络，始终保留卷。额外专项验证临时执行，只将实际结果登记docs，不再把专项脚本留在源码工程。

基础模式仅健康端点，业务模式匿名wishes可查询、未登录me为401；微信缺配置时503，扫描/学校规则仍为开发适配，整体readyz仍503。诊断/探针通过不是领域消费者齐备、外部供应商或生产验收通过。实际结果见最新交付记录；历史记录及旧路径仅代表当时快照。

## 聊天与站内通知

开发装配显式启用六项聊天/站内通知接口，使用`WishKey`经独立HMAC用途派生聊天摘要及游标签名密钥，沿用历史加密根密钥和同一内容主题，不生成替代凭据。应用前显式执行0015迁移并重放权限；日常启动仍不执行DDL。`studentapi.Config.Chat.MaxBodyBytes`为部署技术预算，宿主开发设64KiB，不引入正文字符数产品上限。

提交202只确认持久接收，`delivery_seq`为空；当前待审/驳回/取消/送达状态通过本人状态接口读取。消息列表只含已送达原文，按最终送达序号递增，空页保持请求位置。私聊分类器必须独立注入，缺失时失败关闭，不回退公开内容脱敏器；主动发送的联系方式保留，普通命中经审计人工复核，危机隔离。通知只提供通用进展提示与当前可访问目标引用，无正文或身份快照，已读使用通知自身版本。

任务实现与实际验证见[聊天通知阶段](milestones/2026-10-22-chat-delivery-r1.md)。真实微信外发归T033；未配置外发不会影响站内未读。后续完成/拉黑/处罚/注销领域必须沿用账号及资源统一锁序，原子推进写代次并永久取消存量待审消息，权限恢复不得复活旧任务。

## 完成、还愿及分享

开发装配通过`wish.ServiceConfig.MaxStoryBytes=65536`显式启用八项接口，基础健康入口不启用。首次故事提交使用`wish_expected_version`；改稿及撤回的`expected_version`均比较路径所属心愿聚合`version`，审核落库也递增该版本，客户端通过本人心愿状态重读。故事内容版本单独递增，使用`story_review_result.content_version`跟踪；不能拿它替代聚合版本。故事稳定标识与所属心愿共用技术UUID，接口路径及target_kind区分对象，客户端按不透明标识处理。

确认实现后会话只读，旧待审消息永久取消；普通回退保留原匹配并继续受B01额度校验。提交非空故事即已还愿，待审不公开；改稿立即隐藏旧版，撤回不回退状态，审核不得自动改变为已实现或应愿中。公开故事使用当前精确审核投影，涉校显示“未经证实”，私有原稿不开放读取接口。

分享只存随机引用及目标类型/标识，返回`/pages/share/index?ref=...`路由约定；小程序实际页面接入归T024、微信实机回流归T033，本轮不宣称其可用。打开分享每次重验上架/期限、故事当前版本、撤回、账号生命周期、处罚和隐私屏障，无旧正文快照。0016新增当前故事指针、审核/来源/屏障字段和分享表，须显式迁移及重放bootstrap权限，普通启动只检查结构。

故事和父心愿隐私屏障分开比较。新稿审核只释放其版本与代次已覆盖的故事屏障，不能释放父心愿屏障；父心愿仍被屏蔽时需对应领域完成脱敏重审。任一新屏障或原应愿人注销会让旧故事立即不可公开；原匹配关联清除也不能消除稳定内容ID上的屏障。作者在故事屏障期间也只取得状态、版本与允许动作，不读取旧原稿。已还愿作者可提交新稿，满足当前故事屏障并脱敏通过后才恢复；注销标记/物理清理由T031负责，同锁序夹具仅验证本轮边界。完整记录见[完成还愿分享阶段](milestones/2026-10-22-story-sharing-r1.md)。

## 安全治理接口

开发装配显式启用`studentapi.Config.Safety`，使用从原根密钥独立派生的用途密钥及64KiB说明/申诉技术预算。升级需先在受控迁移入口应用0017并重放权限，普通启动不会迁移。举报类型须由运营交付后显式发布；没有默认业务类型时清单为空。接口、版本、受限会话及当前验证边界见[安全治理阶段记录](milestones/2026-10-22-safety-governance-r1.md)。


## 危机案件与关怀

显式应用0018并重放bootstrap权限后，内容worker会将四类正文的危机命中原子写入限定证据和双投递待办。未提供正式援助资料及通知适配时保留可重试待办，不自动恢复公开。

开发API只有在私有凭据文件显式配置`CrisisDSN`后注册危机后台路由；该连接使用仅属于`liyuanci_crisis_api`的独立受限登录，不复用ReviewDSN或StudentDSN。当前`make dev-init`或`make dev-native-init`会显式为新配置及已有配置补齐`dev_crisis_api`登录与`CrisisDSN`，随机口令只生成一次，重复初始化保留已有DSN、密钥与后台账号。身份不具备超级用户、绕过RLS、建库、建角色或DDL权限；既有bootstrap权限矩阵提供危机证据访问，普通后台仍无证据模式USAGE。普通API/worker启动不初始化身份、不迁移；旧配置未补字段时仍可启动普通业务。宿主派生配置将该DSN转换为所选Docker或原生PG端口。

本地升级步骤：先用`make dev-stop`停止本模式应用，显式执行`make dev-init`、`make dev-doctor`，再在各自终端运行`make dev-api`、`make dev-worker`、`make dev-content-worker`。原生模式使用对应`dev-native-*`入口。管理端仍连接`http://127.0.0.1:18080`；本次默认Docker本地实例已启用危机路由，既有`developer`账号保留`super_admin`角色，口令保持原值，不写入文档。其他后台账号须由超管通过正式账号角色接口授予`crisis_operator`，普通审核角色没有危机证据权限。

管理端联调顺序如下，所有路径前缀为`/api/v1/admin`，使用Bearer会话；POST均带新的`Idempotency-Key`，重复同一请求复用原键。接口返回`data.version`，每次新动作须使用当前版本。

1. 原文人工审核任务经`POST /moderation-tasks/{id}/escalate-crisis`升级，提交`reason`与该审核任务的`expected_version`。举报升级使用`POST /reports/{id}/escalate-crisis`，版本绑定举报。返回新危机案件，状态为`pending_handling`；精确内容被隔离，已公开内容即时隐藏。
2. 用`GET /crisis-cases`、`GET /crisis-cases/{id}`、`GET /crisis-cases/{id}/work`和`GET /crisis-cases/{id}/timeline`查询；证据使用返回的证据标识调用`GET /evidence/{id}`。不存在的案件/证据返回404，未登录401，普通审核角色403，敏感响应禁止缓存。
3. `POST /crisis-cases/{id}/actions`提交`action`、`reason`、`expected_version`。`take_over`进入`handling`，`follow_up`记录跟进，`resolve`进入`resolved`。每步采用上一步返回的案件版本；旧版本409，同键异请求冲突。结案不等于自动解除内容隔离。
4. 对尚未结案的误报，调用`POST /crisis-cases/{id}/resolve-false-positive`，提交理由与当前案件版本。案件变为`false_positive`，危机限制解除、未完成投递取消；仍具资格的内容生成新的普通复核任务，**不自动公开**。管理端重读普通队列和任务版本，按普通流程审核。心愿审核批准后为`ready`，仍需作者显式上架；注销、删除、失效版本等内容不保证重建任务。

可选`Care`对象字段为`version/source/verified_at/hotline_24_hours/appointment/notice`，核验日期使用YYYY-MM-DD；必须来自已交付资料，不能把隔离合成资源用于真实用户。普通关怀通知引用本人卡片，由GET /api/v1/me/care-cards/{id}读取。当前本地未设置`Care`，未注入真实`CrisisNotifier`，人员通知和关怀待办由持久任务保留并按既有逻辑重试；`retry_notification`只调整待办重试时间，不代表已通知。管理端不应显示为真实通知成功。

生产宿主通过`WorkerConfig.CrisisNotifier`显式注入授权人员通知适配器，按投递ID去重，消息只含技术引用；开发默认没有真实通知发送方。接口、角色、迁移和验证边界见[危机服务阶段记录](milestones/2026-10-23-crisis-care-r1.md)。

本次真实本地配置、独立身份及接口检查，以及隔离PG的人工升级/处置/误报HTTP回归，见[本地危机后台接入记录](milestones/2026-10-23-local-crisis-api-r1.md)。`manual`分析器不提供危机识别，当前本地空开发词库也无有效自动危机识别；人工升级可独立于识别与通知服务使用。

## 注销及证据删除

先显式应用0019并重放权限，再为私有凭据文件交付可选`PrivacyDSN`（仅属于liyuanci_privacy_maintenance）、`EvidenceDeletionDSN`（仅属于liyuanci_evidence_delete_api）及独立日志`RecoveryWriterDSN/RecoveryReaderDSN/RecoveryWrapKey`，才注册对应删除入口。恢复日志必须由单独迁移身份在独立资源执行journal-up/journal-permissions；开发初始化不自动创建资源或生成替代密钥。日志读写池必须定位同一当前权威实例与数据库，不能误接另一份副本。正式物理故障域、备份隔离及真实身份仍需交付验收。

`make build`新增`bin/privacy-worker`。以`APP_ENVIRONMENT=integration`、`APP_DEVAPPFILE=/绝对路径/business.json`、`APP_PRIVACY_SCOPE=account`或`evidence`显式启动；账号工作使用PrivacyDSN，证据清理使用另行交付、仅属于liyuanci_evidence_purger的EvidencePurgerDSN。它不随dev-api/card-worker隐式启动，不迁移、不修改已有凭据或启停其他资源。取消后等待在途请求完成再释放池。

本地开发入口没有外部全版本清理/缓存屏障或组合信息脱敏适配器，任务保持processing并保留安全错误码，不模拟全部删除成功。正式宿主通过privacy.New显式注入Eraser、Config.Redactor及独立Journal，再调用Service.Run；缺少适配器不作为真实用户删除验收。幸存心愿生成脱敏新稿但不自动送审，作者显式提交后走强制人工审核；已还愿始终不重新招募。恢复入口Recover扫描含已确认记录的全部意图，不自动开放网络或签发恢复放行。

接口、回执及六行矩阵、迁移/权限、实际验证和未完成依赖见[隐私清理阶段记录](milestones/2026-10-23-privacy-deletion-r1.md)。


## 隐私注销、证据删除与全模块联调

Docker宿主模式新增显式初始化入口，运行前先停止所选项目的Go进程：

```sh
make dev-stop
make dev-privacy-init
make dev-infra DEV_ARGS="--mq --management --monitoring"
make dev-doctor
# 以下各自独立终端常驻
make dev-api
make dev-worker
make dev-content-worker
make dev-privacy-worker
make dev-evidence-worker
```

`privacy-init`复用普通业务显式迁移与权限入口，另创建独立`recovery-postgres`容器/卷和`liyuanci_recovery`数据库。业务库使用`dev_privacy_maintenance`、`dev_evidence_delete_api`、`dev_evidence_purger`三个登录身份，恢复库使用`dev_recovery_writer/reader`，每个身份仅属于对应同名`liyuanci_*`运行组；恢复迁移身份只保存在`.local/local/recovery-migration.json`。新的`RecoveryWrapKey`与历史用途密钥隔离，不替换历史账号、口令或微信配置。已有恢复数据库缺少历史配置时拒绝生成替代密钥。重复初始化保留全部已有凭据。

恢复库默认仅绑定`127.0.0.1:15433`，通过`LIYUANCI_LOCAL_RECOVERY_PG_PORT`覆盖；业务库仍为15432。初始化成功后在operations.env登记`LIYUANCI_LOCAL_PRIVACY_ENABLED=true`，后续`dev-infra`启动该恢复服务；普通API/worker启动不执行迁移。`dev-stop`记录并停止五个Go进程；`dev-infra-stop`再停止本项目基础设施，始终保留数据卷。账号/证据两个清理进程复用privacy-worker二进制，但使用独立scope、锁和PID文件。当前privacy-init不支持原生模式；原生部署需另行显式交付独立恢复集群和凭据。

联调接口为`POST /api/v1/me/deletion-requests`、`GET /api/v1/deletion-receipts/{receipt}`、`DELETE /api/v1/admin/evidence/{id}`与`GET /api/v1/admin/evidence-deletion-jobs/{id}`。注销需要本人令牌、幂等键、confirmation=delete_account及账号expected_version；证据删除需要当前超管、幂等键、reason及证据范围expected_version。202只表示受理；匿名回执不可使用裸UUID。受理后会立即撤销相关会话或阻断目标读取，测试请使用专用测试账号和证据。

本地开发入口没有全版本对象/回收站/缓存清理器，也没有幸存内容脱敏器。worker会运行并重试，但任务保持processing，不能显示已经物理清除。当前内容manual模式保留原文、强制人工复核；危机识别供应商、正式词库资料、已核验援助资料与实际通知均未接入。学生卡扫描和学校规则继续使用既有开发模拟实现；微信配置保留，未做实机登录验证。

2026-10-23本机联调已启动API、学生卡MQ worker、内容MQ worker、账号与证据两个隐私worker，PostgreSQL、独立恢复PG、Redis、NameServer/Broker、pgAdmin、Redis Insight、RocketMQ Dashboard及Alloy/Loki/Grafana/Prometheus。MQ主题显式创建，两个MQ配置使用仓库模板的本地独立组/实例，文件置于.local并通过`LIYUANCI_LOCAL_CARD_MQ_FILE/CONTENT_MQ_FILE`选择。API已装配认证、心愿、应愿、聊天、故事、审核/词库、安全治理、危机和隐私路由。辅助工具地址如下：

| 工具 | 本机入口 |
| --- | --- |
| 后端 | http://127.0.0.1:18080 |
| pgAdmin | http://127.0.0.1:15050 |
| Redis Insight | http://127.0.0.1:15540 |
| MQ Dashboard | http://127.0.0.1:18081 |
| Grafana | http://127.0.0.1:13000 |

pgAdmin已追加“鲤源池本地恢复日志（只读）”连接，未保存数据库口令；口令来源为私有business.json的RecoveryReaderDSN。恢复日志中目标引用为加密信封，不能把数据库查询当成明文导出接口。监控此次启动基础采集栈，只采集Docker日志；未启用中间件exporter、Linux宿主指标及真实通知，宿主Go进程日志仍见`.local/local/logs/`。独立恢复容器不等同生产故障域/备份隔离。实际检查与限制见[本地全模块启动记录](milestones/2026-10-23-local-privacy-startup-r1.md)。
