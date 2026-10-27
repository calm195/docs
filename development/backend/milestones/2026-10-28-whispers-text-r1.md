# 悄悄鲤文字、身份与昵称领域

日期：2026-10-28（Asia/Shanghai；实施与验证开始于2026-10-27）。任务 B03；关联 REQ-009、REQ-011、REQ-018、REQ-020。依据[已固定后端计划](2026-10-27-whispers-backend-plan-r1.md)，继承[数据与命令基础](2026-10-27-whispers-foundation-r1.md)及[精确提交补证](2026-10-27-whispers-foundation-commit-r1.md)。

## 基点与提交

- 源码分支 `develop`，本阶段基点 `4517d9bee3c25b57a1bf52c9be4da859dfef8b73`；用户已授权按功能与依赖顺序提交。先提交命令／迁移 `351de6e32a5c5610035931b8352f8a6d73460c68`，再提交文字领域、HTTP及限频 `0fa7d8cf03ebe0e2365b58aa72ede6781ea403cc`。本阶段共28个文件，逐文件指纹及检查证据见[验证摘要](../validation/2026-10-28-whispers-text-r1.json)。
- docs 分支 `backend-develop`，基点 `622b2a855a350353f7c6749eb2aa8795402b0650`，工作树 `/private/tmp/liyuanci-docs-backend-develop`。主 docs 检出保持 main；历史固定记录及指纹不改写，本记录在源码提交后补齐精确SHA再固定。
- 契约 `whispers/1.0.0`；固定 contracts 不变。需求、批准和共享台账未改写，没有签发 G1／G2／G3。

【完成事实】文字领域与13个HTTP操作在隔离环境验证完成；默认进程未注册新路由，生产未启用。送审为可注入的同事务持久工作边界，缺失适配时503，真实树洞审核批准／危机消费者等待B04，不能据此宣称真实文字审核闭环或三端联合验收通过。

## 实现与可测试验收

| 范围 | 结果与边界 | 验证 |
| --- | --- | --- |
| 草稿与完整替换 | 已认证且normal方可创建／编辑；正文保留空白、1–500 Unicode码点、拒绝纯空白；新不可变正文版本、随机注册内容、用途绑定信封密文；草稿不产生审核任务 | API运行角色真实写入，原稿不以明文落库，旧资源版本拒绝，并发完整替换只成功一次 |
| 提交与撤回 | 提交校验本人、当前身份与状态，创建新审核轮次及task；withdrawn重提重新送审；保存／撤回递增评论上下文代次，取消旧帖子及待审评论task，移除公开指针 | 真实task／work／outbox同事务；撤回取消旧task；缺ReviewSink不接受成功命令 |
| 三档身份 | anonymous、semi、named互斥；semi校验显式当前字典版本和枚举；named仅引用本人active已批准版本。独立随机别名按帖子／账号固定，不从账号派生 | 字典变更409、缺资料MODE_UNAVAILABLE；跨帖子随机别名单测、无公开账号字段 |
| 昵称 | 逻辑初始偏好version=1，账号guard下首次写入懒初始化；候选版本不可复用，新候选不替换active；旧审核取消；历史内容引用原批准版本 | 未认证normal也可提交昵称；合成批准后可用named，新active不改旧快照，旧昵称撤销即404 |
| 公开与本人 | 独立DTO；公开只读当前批准／发布意愿／账号存续及认证有效且无限制／屏障的投影，昵称撤销同步隐藏；隐藏设置或停用标签实时退匿名；本人屏障状态先遮蔽原稿，公开旧稿不直接交给编辑器 | 同步隐藏、昵称撤销、隐私屏障、跨主体本人访问、幂等回放当前状态负例通过 |
| 分页 | 公开按published_at DESC,id DESC；本人按created_at DESC,id DESC；limit默认20、1–50；签名游标，主体经用途隔离HMAC后再入游标；候选有界，过滤项也推进游标 | 篡改、跨主体、跨公开／本人入口拒绝；游标正文不含账号明文 |
| 配置与援助 | 显式Catalog快照，缺字典version=null/items=[]且semi_available=false；缺援助返回unavailable/null/[]，不预置号码；workspace按当前权限给出本阶段动作 | 固定schema、缺资料、关闭模块仍可取公众资料；正式资料尚未交付 |
| 严格HTTP | 13操作；独立成功／错误协议、no-store与no-cache；16KiB、精确字段、重复键、大小写、未声明null、非法UTF-8／孤立代理项、未知查询、非规范资源ID均拒绝；所有写入要求UUID幂等键 | HTTP失败表驱动；真实HTTP13份响应按固定schema校验 |
| 限频 | Redis账号用途隔离摘要键；帖子创建／提交合并5次10分钟及20次24小时，昵称3次24小时；滚动UTC窗口，所有窗口原子判断，失败503，429含Retry-After秒数；撤回／编辑独立60次每分钟维护预算，不被发布额度阻挡 | 真Redis并发20抢5、长短窗口、昵称预算、失败释放和断连失败关闭；文字命令也连接真实Redis |
| 幂等生命周期 | 同主体、方法、规范路径和请求HMAC绑定；当前权限先于回执，重放不重扣预算；最小回执绑定业务生命周期，技术TTL过后也不能重新创建失效内容 | 同键异体冲突；过期仍返回同结果；结果失效404且不重新执行；屏障后重放无历史正文 |

[50操作状态矩阵](../validation/2026-10-28-whispers-text-operations-r1.json)另建本端快照：13个isolated-tested，37个pending；全部production_enabled=false。评论开关、评论、抱抱写入／互动计数资格筛选、通知、胶囊、opaque切换及后台能力分别属于后续任务，不在本阶段冒充可用动作。

## 结构、迁移与运维

- `internal/whisper/`：显式依赖、领域规则、命令与投影；GORM查询集中repository且WithContext；独立DTO不序列化实体。加密用途区分post_body、post_identity与nickname，正文／身份原稿不放入回执、游标或工作载荷。完成日志只记录operation、结果、request ID和耗时。
- `internal/httpapi/whisper.go`：显式RegisterWhispers，不改变cmd/server／studentapi默认装配；公共、本人与昵称路由分开。
- `internal/platform/whisperrate/`：注入Redis与独立用途密钥，context有界（最多1秒），原子滚动窗口及精确预留释放。命令回执重放发生在准入前；只在新Apply内预留。Redis与PG不宣称跨库原子：已知回滚释放，提交结果不明或释放依赖失败时保守保留预留至窗口过期，防止放大额度。
- 新增0022，不改0012／0021：既有审核task要求restriction_epoch>0，与树洞权威初始0冲突，新增迁移允许>=0，不伪造加一快照。已有零代次任务时down拒绝。
- 新增0023：command_receipts增加lifecycle_bound及中文数据库对象注释；旧命令仍使用原技术TTL，新文字命令选择业务生命周期回执。API仅增加该列更新权限，不开放主体／幂等键更新；已有生命周期回执时down拒绝。后续GC不得按expires_at删除这些最小tombstone，资源／账号注销联动由B07继续接通。
- **升级此版本所有业务API／worker前须由专用迁移身份显式应用至0023并重放权限**，共享命令引擎会读取新列；普通启动不执行DDL。make run健康模式保持原行为。
- Dockerfile与隔离Compose增加文字及限频测试二进制，make integration执行；源码README同步升级与启用前置。无依赖版本变化，无需go mod tidy；未新增运行账号、正式字典或援助信息。

## 实际检查与依赖

| 检查 | 实际结果 |
| --- | --- |
| make check-fast PACKAGES=相关6包 | 通过 |
| make fmt、make check | 通过；只读格式检查、go vet ./...、go test -race -cover ./... |
| make build | 当前Makefile列出的9个进程构建通过 |
| python3 -m unittest discover -s scripts -p 'test_*.py' -v | 35项通过 |
| 独立隔离PG基础／命令锁／文字事务 | 通过，含API受限运行角色、并发替换、生命周期回放与13操作真实HTTP |
| 业务schema／历史迁移／故事公开迁移回归 | 3个顶层用例通过；账本至23，数据库对象注释检查通过 |
| make integration | 真实PG／Redis／RocketMQ，17个顶层用例通过，含文字命令连接真实Redis；既有链路回归无失败 |
| 固定契约＋真实Wire schema | 固定50操作／98schema／75样例静态检查通过；本阶段13份真实成功响应逐项通过 |
| docs文档及固定指纹、两仓库git diff --check | 本记录固定后运行，作为交付门槛 |

实际日志、指纹与[真实Wire](../validation/2026-10-28-whispers-text-wire-r1.json)均在同端validation目录。Go单元检查按规范跳过未配置DSN的集成用例，真实数据库结论来自上述显式隔离测试，不把skip算集成通过。初次相关检查曾因Go缓存沙箱权限受限，申请必要权限后复跑；送审首次真实PG因原有正数约束失败，新增0022后复跑通过；隔离Python复用已有jsonschema环境，未修改全局依赖。

【真实／替代边界】PG、Redis、Gin和API数据库角色是真实；旧链路回归使用真实MQ。树洞ReviewSink仅写专用隔离持久工作，未向旧消费者分发；树洞批准由显式SQL夹具构造。KMS包裹用隔离AES测试主密钥，字典用合成资料。没有调用真实审核、危机或资料供应商，不宣称文字已审闭环、WI联合用例或容量验收。

【未完成范围】B04提供审核／危机及最终批准、新旧列表隔离；B05互动及计数筛选；B07全图隐私／恢复删除、回执清理与opaque兼容；B08在这些前置满足后显式装配并按授权启用。现有普通隐私worker不会自动发现树洞图，不能提前部署开放发帖。未推送、合并、部署或上线；本次测试仅使用任务专用隔离项目，停止不删除卷。
