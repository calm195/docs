# 业务消息链路收口阶段记录 r1

日期：2026-10-22（Asia/Shanghai）。任务：用户要求先推进T007业务消息链路收口，完成开发、验证和docs阶段记录。关联REQ-006、REQ-007、REQ-015、REQ-017、REQ-018、REQ-019（重驱动权限与审计）、REQ-020；本次仅验证适用消息与学生卡子范围，不把完整聊天、危机、注销或生产验收写成已完成。

## 基点与范围

- 修改前两仓库均为干净main；源码与docs分支均为`codex/business-message-chain`。
- 源码完整HEAD基点：`72c7d49f82ac3e3c028ae0f7632f903e91e7add1`。
- docs完整HEAD基点：`87028d13237018c4eb054c930afa30b32c712cba`。
- 当前交付为未提交工作区；上述源码HEAD不包含本轮修改。未执行提交、推送、合并或部署。交付文件指纹在本阶段对应验证证据中登记。
- 共享契约保持0.2.0、B07静态动作索引revision 5；审核扩展仍draft-not-active，不改需求、审批、固定契约或共享协调台账。

历史来源为[持久工作阶段](phase-04.md)、[独立运输验证](t007-mq-validation-2026-10-21.md)和[开发进程接线](phase-10.md)；其原文及固定指纹保持，原“不同PG/MQ测试未组成领域闭环”等描述是当时事实，本阶段仅补本轮新增证据，不改写旧验收状态。原记录SHA-256见验证清单。

## 已实现与取舍

1. 复用已有durable发件箱/租约、运输适配、学生卡三段处理和cardworker调度模块，为实际cmd/card-worker接入显式消息配置。默认无MQ数据库轮询保持；指定APP_CARD_MQFILE后同时运行转发、订阅、补偿，无效配置拒绝启动。
2. 配置加载位于internal/config，拒绝未知字段；通道/身份/预算在任何客户端启动前验证。宿主入口通过LIYUANCI_LOCAL_CARD_MQ_FILE映射私有绝对路径，继续清除终端遗留APP覆盖，不复用探针客户端或主题。模板在configs/examples，实际凭据留在.local或显式外部路径。
3. 资源归装配边界：取消后停止接收和轮询，等待在途处理，关闭生产者，再释放数据库/对象依赖。只有隔离integration环境允许开发扫描适配；生产仍拒绝该进程，不自动创建主题、迁移、初始化账号或重置历史工作。
4. 通用受控重驱动在同一命令事务内写入access_audits：purpose区分work.redrive.resumed/cancelled，outcome沿用allowed枚举，subject_ref为随机工作引用。成功/失效终结都保留审计；审计失败必须回滚工作、事件替代、新唤醒及命令回执，并发幂等重放只提交一份审计。技术完成日志不替代业务审计。
5. make integration在原探针往返后建立独立业务主题，通过锁定Go 1.25镜像构建测试制品，串行执行真实PG持久工作/重驱动用例与同一PG/Redis/MQ学生卡领域链。测试代码仅在专用镜像，不进入普通运行镜像，不增加长期专项验收脚本。补齐旧持久工作测试账号退出清理，保证专用测试库可重跑。
6. 没有新增表、字段或改写任何已应用迁移；复用现有运行权限，真实集成核对表/字段数据库对象注释非空。普通make run与探针cmd/worker职责保持。

## 验证与故障修复

- `make fmt`、`make check`（只读格式、go vet、go test -race -cover）及`make build`最终全部通过。宿主Go为1.27.2；普通检查无显式DSN的中间件用例明确跳过，不算作真实PG/MQ覆盖。依赖未变更，无需go mod tidy。
- 相关包迭代检查`make check-fast PACKAGES='./internal/config/... ./internal/cardworker/... ./internal/devapp/... ./internal/transportmq/... ./internal/studentcard/...'`及新增durable相关检查通过。
- `python3 -m unittest discover -s scripts -p 'test_*.py' -v`：29项通过，包含默认无MQ、显式私有配置映射与原生/宿主入口保护。
- 最终`make integration`退出0，项目`liyuanci-messages-899ad7f761`，使用共用Compose锁定PG18.6、Redis7.2.12、RocketMQ5.3.2及Go1.25.0 builder。原探针往返通过，真实持久工作、消费者、补偿/重驱动三组PG测试通过；同一PG/Redis/MQ学生卡链五个子用例全部通过（4.02秒）。包括领域提交后返回NACK的Broker重投、重复/取消晚到、扫描外部失败重试、过期租约与独立调度恢复、独立受限登录运行实际card-worker制品并TERM正常关闭。
- 在同一项目、同一数据库与保留Broker数据上执行`docker compose -f deploy/compose/integration.yaml run --rm business-test`退出0，再次通过三组PG测试和五个领域子用例（3.85秒），证明修复后夹具可重复执行。这里复跑是针对前轮发现的测试账号残留风险，未重复无关验收。
- 迭代发现并修复导入循环、关闭前复用SDK客户端实例、审计结果不符既有枚举、旧数据库测试夹具账号残留、macOS临时路径符号链接断言等问题。失败未计作通过，最终在全新独立项目运行完整入口并在同库复验。沙箱首轮Go缓存读取受限，已授权重跑成功；未修改既有迁移来绕过约束。
- 源码及docs的`git diff --check`通过；`python3 scripts/check_documents.py`通过，覆盖文档链接、历史固定指纹和迁移映射；新增记录登记固定清单后再次复核。

真实用例原始测试输出摘录见[集成证据](../validation/2026-10-22-business-message-chain-integration.txt)，源码文件指纹、契约指纹、实际命令与资源记录见[验证清单](../validation/2026-10-22-business-message-chain-r1.json)。本轮两组临时隔离项目均只清理容器/网络，保留全部卷和忽略目录原凭据；日常liyuanci-local资源未启停。

## 边界与剩余

【事实】真实资源为本次随机Docker项目内PG/Redis/RocketMQ；学生身份交换、KMS、私有对象与扫描使用明确合成夹具，开发进程本身也使用隔离文件密钥和模拟扫描。提交后ACK前故障采用领域事务提交后返回NACK，验证真实Broker重投；不声称执行了提交瞬间操作系统kill或Broker断网/磁盘故障。

【事实】本次收口通用可靠链路、实际学生卡消息接线与原子重驱动审计。安全重驱动仍为服务端注入策略的库命令，没有新增对外管理HTTP/UI、待办列表或生产操作入口；这些须按正式契约与各领域权限另行接入。未来T016/T019/T021/T029/T031的领域取消、隐私/处罚矩阵和实际外发能力由对应任务实现，不能由本次学生卡取消夹具替代。B13可由协调者据证据更新已完成子项，不在本端擅自关闭整体阻塞或签发T007完整产品验收。

【未验证】生产ACL/身份、消息保留/死信运维、真实供应商、完整跨端业务链、性能、D05独立删除日志及全副本恢复。宿主入口的私有路径映射已作离线回归，真实子进程在隔离Docker网络验证；未启停用户的日常宿主应用，未重复无关监控验收。整体readyz与生产未验收边界保持。

【建议】后续先交付T016审核领域消费者与正式管理契约，再将通用重驱动命令绑定精确对象授权和受控待办入口；真实资源/全副本条件按既有依赖清单落实。
