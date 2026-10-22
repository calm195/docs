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

## 旧配置导入与资源归属

首次初始化目标尚不存在时，从`~/.config/liyuanci/<模式>/`复制配置、密钥、口令和对象，重写文件引用，原目录保留。`make dev-import`或`dev-native-import`只执行导入，不连接业务库或重置账号；已有目标绝不覆盖。运行中的旧应用先停止，避免对象目录并发写入；缺失原引用时不发布半成品目标。旧卷或旧库缺原密钥时仍拒绝生成替代值。

`business.json`保存初始化身份与密钥，迁移身份在独立business-migration.json；business.host.json是可重建的宿主派生文件。对象目录属于持久数据，不当作缓存删除。旧容器对象卷不会自动搬迁。

默认端口可用`LIYUANCI_LOCAL_PG_PORT/REDIS_PORT/API_PORT/NAMESRV_PORT`修改；Broker10911/10909固定。不同项目保持同一组`DEV_ARGS="--project liyuanci-local-主题 --env-file /实际路径/operations.env"`，模式/归属不匹配拒绝执行，端口冲突不停止其他项目。

普通停止始终保留数据卷。用户于本次会话另行明确授权全局删除无引用资源：清理时检查所有运行和停止容器的卷/网络引用，保留被引用资源及默认网络，不使用force/prune；该授权不使普通停止命令具有删卷行为。

## IDE与验证

`make dev-config`或`dev-native-config`刷新派生文件。IDE调试cmd/server设置APP_ENVIRONMENT=integration、APP_DEVAPPFILE为实际business.host.json、APP_DATABASE_DRIVER=postgres、APP_DATABASE_DSN=devapp、APP_REDIS_ENABLED=true、APP_REDIS_ADDRESS为实际地址、APP_ROCKETMQ_ENABLED=false、APP_SERVER_ADDRESS为实际loopback地址，参数`-config ""`。需要Redis口令时显式设置APP_REDIS_PASSWORD。cmd/card-worker只需APP_ENVIRONMENT、APP_DEVAPPFILE。IDE进程由IDE管理，入口只停止自己记录且可执行路径匹配的PID。

日常相关包检查用`make check-fast PACKAGES=./internal/模块/...`；交付前`make fmt`、`make check`，Go变更另`make build`；离线脚本测试用`python3 -m unittest discover -s scripts -p 'test_*.py' -v`。`make integration`直接声明真实PG/Redis/MQ、显式探针迁移和重复回执往返，调用者提供隔离项目和测试口令并负责清理。额外专项验证临时执行，只将实际结果登记docs，不再把专项脚本留在源码工程。

基础模式仅健康端点，业务模式匿名wishes可查询、未登录me为401；微信缺配置时503，扫描/学校规则仍为开发适配，整体readyz仍503。诊断/探针通过不是领域消费者齐备、外部供应商或生产验收通过。实际结果见最新交付记录；历史记录及旧路径仅代表当时快照。
