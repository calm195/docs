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

提供独立`ModerationKey`时，开发API显式装配正式0.2.0已有的七项普通审核/词库路由：列表、详情、决定以及词库列表、快照详情、创建和发布。默认健康模式不启用，未补用途密钥的旧配置也不隐式开放新路由。普通案件只可访问心愿的普通/涉校命中精确版本；危机命中不出现在该队列，原文详情与决定写持久审计，学生令牌不能进入后台。

词库按完整快照创建，以heads.kind.version比较并发基准；发布同时比较草案资源版本、head代次及base_effective_id。发布原子归档旧版，不自动重扫历史；归档只读且不可直接重发。新扫描固定记录当时三类规则版本。正式运营词库和样例仍须D03资料方交付，不能把测试词条当正式内容规范。

`moderation.NewWorker`要求显式注入真实文本安全/个人及组合信息处理器，无默认放行实现。它提供MQ Handler和有界`ProcessNext`数据库补偿；分析在事务外执行且允许纯分类重复调用，最终在统一锁序下复核账号/处罚、任务绑定、内容/限制/屏障代次，原子写结果与稳定操作回执。正常通过只到ready，涉校/普通命中人工复核，危机命中持久隔离；作者仍须主动上架。分析失败保持不公开并按预算重试/待办。

日常card-worker仍只处理学生卡。独立内容进程通过`make dev-content-worker`或`make dev-native-content-worker`前台启动，沿用所选配置的受限WorkerDSN和历史密钥，不要求对象目录或Redis，不执行DDL或初始化词库。`dev-stop`同时等待三个宿主进程退出，始终保留中间件及卷。

内容进程默认没有分析供应商，分析失败保持待审，按持久任务预算重试后转异常待办。仅在隔离开发中，可在operations.env显式设置`LIYUANCI_LOCAL_CONTENT_ANALYZER=synthetic`，将结果正文替换为固定合成文本并清空标签；原文三类词库命中仍有效，合成模式不代表实际隐私检测。生产拒绝该开发进程。后续供应商到位后，attention任务须经既有显式恢复流程处理，普通重启不重置尝试次数。

默认无MQ，仅有界轮询数据库。消息模式先显式创建`liyuanci_content_review_v1`主题，复制源码`configs/examples/content-worker-mq.yaml`到所选.local目录，设置`LIYUANCI_LOCAL_CONTENT_MQ_FILE`。直接运行对应`APP_CONTENT_MQFILE`和`APP_CONTENT_ANALYZER`。事件为`wish.review_requested`，与学生卡通道隔离；同时运行发件箱转发、订阅及数据库补偿。调度和消息处理预算至少20秒，覆盖查询、分析及最终事务，关闭等待在途操作后才释放池。实际生产供应商仍未交付。危机完整案件/关怀由后续危机领域接入，当前隔离不等于危机处置闭环。`target/allowed_actions`扩展继续未激活，下线/解除限制接口未开放。

## 旧配置导入与资源归属

首次初始化目标尚不存在时，从`~/.config/liyuanci/<模式>/`复制配置、密钥、口令和对象，重写文件引用，原目录保留。`make dev-import`或`dev-native-import`只执行导入，不连接业务库或重置账号；已有目标绝不覆盖。运行中的旧应用先停止，避免对象目录并发写入；缺失原引用时不发布半成品目标。旧卷或旧库缺原密钥时仍拒绝生成替代值。

`business.json`保存初始化身份与密钥，迁移身份在独立business-migration.json；business.host.json是可重建的宿主派生文件。对象目录属于持久数据，不当作缓存删除。旧容器对象卷不会自动搬迁。

默认端口可用`LIYUANCI_LOCAL_PG_PORT/REDIS_PORT/API_PORT/NAMESRV_PORT`修改；Broker10911/10909固定。不同项目保持同一组`DEV_ARGS="--project liyuanci-local-主题 --env-file /实际路径/operations.env"`，模式/归属不匹配拒绝执行，端口冲突不停止其他项目。

普通停止始终保留数据卷。用户于本次会话另行明确授权全局删除无引用资源：清理时检查所有运行和停止容器的卷/网络引用，保留被引用资源及默认网络，不使用force/prune；该授权不使普通停止命令具有删卷行为。

## IDE与验证

`make dev-config`或`dev-native-config`刷新派生文件。IDE调试cmd/server设置APP_ENVIRONMENT=integration、APP_DEVAPPFILE为实际business.host.json、APP_DATABASE_DRIVER=postgres、APP_DATABASE_DSN=devapp、APP_REDIS_ENABLED=true、APP_REDIS_ADDRESS为实际地址、APP_ROCKETMQ_ENABLED=false、APP_SERVER_ADDRESS为实际loopback地址，参数`-config ""`。需要Redis口令时显式设置APP_REDIS_PASSWORD。cmd/card-worker默认只需APP_ENVIRONMENT、APP_DEVAPPFILE；显式消息模式另设APP_CARD_MQFILE。IDE进程由IDE管理，入口只停止自己记录且可执行路径匹配的PID。

日常相关包检查用`make check-fast PACKAGES=./internal/模块/...`；交付前`make fmt`、`make check`，Go变更另`make build`；离线脚本测试用`python3 -m unittest discover -s scripts -p 'test_*.py' -v`。`make integration`直接声明真实PG/Redis/MQ、显式探针迁移和重复回执往返，并在同一隔离项目执行持久工作/重驱动审计及学生卡消息领域链。该入口会迁移并清理业务测试夹具，只能指向独立测试项目，不使用日常业务库。调用者提供隔离项目和测试口令并负责停止容器/网络，始终保留卷。额外专项验证临时执行，只将实际结果登记docs，不再把专项脚本留在源码工程。

基础模式仅健康端点，业务模式匿名wishes可查询、未登录me为401；微信缺配置时503，扫描/学校规则仍为开发适配，整体readyz仍503。诊断/探针通过不是领域消费者齐备、外部供应商或生产验收通过。实际结果见最新交付记录；历史记录及旧路径仅代表当时快照。
