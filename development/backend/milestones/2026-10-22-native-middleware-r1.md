# 原生PostgreSQL与Redis开发方式 r1

日期：2026-10-22（Asia/Shanghai）。用户补充授权：增加使用本地PG/Redis的方式，最多启动MQ Docker即可提供开发服务。追踪REQ-018/020工程范围，不新增业务REQ或改变批准契约。

## 基点与历史引用

继续使用两仓库同名`codex/host-development`分支，保护上一轮未提交实现与文档。源码完整HEAD基点`c21c727dfc8750dcc878a95084a4dcb3b2e47eb1`，docs完整基点`45e6344dd09f36b4301a9ddd6ef829c11052f6bc`。本次仍是未提交工作区，未获提交/推送/部署授权；HEAD不包含新增实现。契约0.2.0及B07 revision 5未修改。

承接[宿主开发交付记录](2026-10-22-host-development-r1.md)及其[固定证据](../validation/2026-10-22-host-development-r1.json)，原文件字节和指纹保持不变。本轮增量文件、完整工作区文件SHA-256及旧证据指纹见[本次验证证据](../validation/2026-10-22-native-middleware-r1.json)。

## 实现与边界

- 增加`make dev-native-init/infra/api/worker/doctor/config/stop/infra-stop`及`dev-native-mq`，默认项目`liyuanci-local-native`、独立配置`~/.config/liyuanci/native/operations.env`，不与Docker PG/Redis配置混用。
- 原生服务由使用者预先启动；入口不安装、启停、重置或清理本地PG/Redis。默认连接127.0.0.1:5432/6379，可配置端口。infra只检查本地端口；doctor验证实际身份、结构、Redis认证及目录。无MQ的完整开发流程不调用Docker。
- 原生显式初始化通过宿主psql和Go迁移工具执行，以本地管理员创建隔离业务库/角色和配置权限。运行身份受限，不让API/worker继承管理员PG环境。管理员口令、Redis默认用户口令可来自仓库外文件，不放命令行或日志。重复初始化保留账号和密钥；原库缺原配置时拒绝生成替代密钥。
- 复用现有密钥、数据库权威、RLS、事务、幂等及对象适配；派生配置转换为原生端口和共享目录。旧Docker数据不自动搬迁。
- MQ使用独立`compose.native-mq.yaml`，仅NameServer/Broker及一次性卷权限助手，不含PG/Redis或应用容器。启动登记支持部分失败后清理；infra-stop仅停止本入口登记过的MQ并保留卷，始终保留原生PG/Redis。原生模式拒绝管理/监控启动参数。
- 新增原生配置示例、真实原生检查脚本，更新README、AGENTS和当前[开发操作说明](../host-development.md)。既有Docker PG/Redis模式保留。

## 实际验证

1. Python单测24项通过，包含原生配置/口令文件、管理员环境隔离、零Docker的基础设施/停止、仅MQ启动及模式混用拒绝。
2. `python3 scripts/check-native-dev.py`通过：脚本创建临时原生PG18.6和Redis8.10.2并启用口令，验证显式迁移/权限、重复初始化、API和业务worker启动、后台真实登录/授权、重启保留会话及停止保留原生服务。Docker调用哨兵未触发。未改动用户正在运行的本机服务。
3. `python3 scripts/check-native-dev.py --mq`通过：基础流程仍零Docker；可选阶段仅Docker NameServer/Broker运行，宿主探针经原生PG/Redis完成真实MQ发送、独立消费、重复回执。一次性卷助手完成后退出。测试资源已停止，数据和凭据保留。
4. `python3 scripts/check-local-dev.py`回归通过，确认共享初始化与配置改动不破坏原Docker PG/Redis的宿主开发路径。
5. 本轮实际执行`make fmt`、`make check`，只读格式、vet、race/cover通过。Go源码和依赖与上一阶段验收指纹一致，未新增Go变更，复用上一阶段make build通过证据，不将其描述为本轮重新构建。
6. docs文档/固定指纹与两仓库diff空白检查通过；固定清单仅追加本记录及证据。旧Docker编排和Broker配置未改，本轮未重复旧完整Docker启停/监控/往返专项，不宣称已重跑。

## 风险与未完成范围

原生模式须具备本地psql和可创建开发角色/数据库的管理员；服务和版本由使用者管理，仅本机PG18.6/Redis8.10.2经过本次真实验证。已存在同名开发库/角色时须复用原配置，脚本不重置其口令。Redis当前支持默认ACL用户口令。端口冲突拒绝启动，不停止其他项目；本地PG/Redis服务和数据始终由使用者管理。

这是额外的日常开发方式，不改变完整业务就绪、真实外部供应商或生产验收状态。微信缺配置仍503，扫描/学校规则沿用既有开发适配，整体readyz仍503；业务worker仍按数据库轮询，MQ探针通过不代表领域消费已齐备。
