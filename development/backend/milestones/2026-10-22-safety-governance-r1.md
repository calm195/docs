# 拉黑、举报、处罚、警告与申诉服务

## 任务与基点

任务T026；关联REQ-004、REQ-005、REQ-006、REQ-007、REQ-014、REQ-016、REQ-019，覆盖014-A/B/D/E、016-A–D及RR-001/002/003、AR-002相关后端边界。用户授权整体实现后集中测试、修复、提交推送，沿用源码`develop`和docs`backend-develop`，不合入main；本轮按该明确指令覆盖同名codex分支默认规则。

源码基点`43836de825c0c26d55c10b958c7f298e09996417`；docs基点`685c5e544f25a5c70018d55d5ae8a3b8813e507a`；两工作区开始时干净。精确源码提交：`1ac89d72216d4d860327b67ea0b115cbbab2c7c4`。契约依据为共享0.2.0/revision 5、已批准需求基线与设计；原固定输入不改写。本文是本端实现和验证事实，不代表三端联调、G1/G2/G3签发或生产验收。

## 实现和接入

新增`internal/safety`，学生与后台分别使用普通API池、后台审核池。`studentapi.Config.Safety`须显式提供命令预算、独立用途密钥、说明/申诉字节预算；开发装配从原私有根密钥派生独立用途，64KiB为技术传输预算，不新增产品字数限制。基础`make run`仍只提供健康端点。所有写入使用统一命令事务、排序账号guard、完整资源集合重发现、幂等回执、当前会话和角色复核；完成日志不含正文、学号、口令或DSN。

| 接口（前缀/api/v1） | 输入和结果 |
| --- | --- |
| POST /me/blocks | target_user_id；200返回target_user_id、blocked=true |
| GET /me/blocks | 本人有向列表；target_user_id、version；供解除时取得精确版本 |
| DELETE /me/blocks/{id} | expected_version；204；仅解除本人方向 |
| GET /report-types | 仅返回运营已发布类型；未交付时空清单，无默认业务类型 |
| POST /reports | target_kind、id、type_code、可选description；202对象引用 |
| GET /me/warnings | 本人尚未确认警告，受限会话仍可读 |
| POST /me/warnings/{id}/display、/ack | expected_version；首次服务端展示+30秒可确认，提前409 WARNING_WAIT_REQUIRED |
| POST /me/appeals、GET /me/appeals | penalty_id、body；受限本人可提交和读取本人结果 |
| GET /admin/reports、GET /admin/reports/{id} | 当前角色和具体普通案件授权；详情仅精确允许内容及说明，访问审计先提交 |
| POST /admin/reports/{id}/decision | confirmed/dismissed、非空reason、举报独立expected_version |
| POST /admin/users/{id}/penalties | violation_ref、content_ref、content_version、level、reason、账号expected_version；绑定同一账号及精确内容 |
| GET /admin/appeals、GET /admin/appeals/{id} | 列表不带正文；具体普通申诉详情才解密申诉正文及原处置理由并记录访问 |
| POST /admin/appeals/{id}/decision | uphold/revoke、非空reason、申诉独立expected_version |
| POST /admin/contents/{kind}/{id}/offline、/release-restriction | reason、expected_version；普通违规限制独立于账号处罚、危机与隐私屏障 |
| POST /wishes/{id}/exception-exit | 心愿expected_version；合法拉黑方或未受罚方操作，返回标准WishResult字段 |

共享固定OpenAPI已有主写接口；GET本人拉黑列表、两个具体案件详情为补全可操作后台与解除版本读取的辅助入口，其字段投影以本记录为准，未原地改写固定共享契约。故事内容操作沿用所属心愿聚合版本，application/message分别使用各自version。处罚使用账号version；警告使用penalty.version；举报、申诉各自独立版本。创建的202回执仅表示持久受理（status=pending），重放不返回正文；处理后的状态通过授权列表读取。

## 关键规则与取舍

1. 任一方向拉黑均取消双方尚未匹配的待审/有效申请和已有匹配中的待审消息，旧审核任务失效，会话写代次递增；保留已有匹配。解除一个方向不解除另一方向，旧交互不恢复。新建拉黑以账号单调版本分配关系版本，删除后重建不会复用旧DELETE版本。回执重放在新关系存在时不能伪称已解除。
2. 处罚只接收已确认举报或普通违规已驳回审核案件，必须匹配目标作者、content_ref及content_version。普通审核运营、危机运营、超管可处置普通案件；危机命中或有效危机限制拒绝进入普通路径，不开放完整学生身份或任意私聊搜索。危机专用案件处理继续属于T029。
3. minor固定warning，移除违规内容，不暂停无关匹配；general固定mute 168小时；severe固定ban、无到期时间。客户端任意时长字段被严格JSON解析拒绝。同违规同动作跨键去重，不重复处罚和通知；同键异请求409。处罚、内容限制、下线、取消、审计、站内通知同事务，通知失败整单回滚。
4. 禁言/封禁实时阻断双方交互，保留匹配原状态，下线受罚者上架心愿，取消待审交互及旧待审内容任务。不递增auth_epoch以保留原本人受限会话；限定入口仍从数据库复核有效会话。禁言到期恢复当前权限；永久封禁无自动到期。封禁不能读历史会话/消息，只可读本人警告、申诉和处置/申诉结果通知等受限投影。通知只携带安全目标引用。
5. 警告首次display持久记录数据库起点及confirmable_at；重进不重置；remaining_seconds向上取整且界于0–30。未展示或29秒确认失败，满30秒可确认。提前失败不落幂等回执，同键在满时后可重试；非本人404，版本过期409；警告不升级成禁言。
6. 例外退出从matching或realized转withdrawn，结束当前匹配、取消旧申请、会话只读、期限不刷新，不经过B01，也不新占额度。仅拉黑方或处罚场景未受罚方可操作；fulfilled拒绝主动退出。满额和期限已过不阻止合法退出；原违规/处罚/危机限制保留。
7. 申诉正文、举报说明、处罚及人工下线/解除理由以用途绑定信封密文存储；申诉结论理由沿既有允许披露字段保存。revoke只撤目标处罚，不解除其他处罚、违规内容限制、危机隔离或隐私屏障；不重配、上架或重放旧交互。仍保留的匹配按原状态和当前限制恢复权限，realized会话保持只读。
8. 已送达违规消息保留送达序号和原存储引用，当前正文读取按内容限制过滤，避免回退计数器或制造重投新序号。普通内容解除限制不自动公开；须由本人后续显式业务操作并重新通过所需审核。案件详情在换版、注销或屏障生效后不回显旧公开正文。

## 迁移与运营依赖

新增0017，原迁移不变：blocks.version；reports精确内容绑定、版本、说明密文和决定理由；appeals.version；penalties精确内容与理由密文；content_restrictions下线/解除理由密文；report_types。所有新增表、字段均有中文COMMENT和实体映射，队列索引与明确上下行迁移同时提供；存在新治理数据时拒绝丢失理由/版本的回退。

升级需停止旧Go进程，以专用管理员/迁移身份显式应用0017并重放当前bootstrap权限，再重启对应Go进程；普通启动只检查结构、不执行DDL。开发可沿用已有`make dev-init`或`make dev-native-init`显式入口和原私有凭据。运行身份无DDL；学生池只新增警告展示/确认/版本列UPDATE及本人拉黑DELETE权限；后台只增加所需关系、会话与下线代次字段权限。

D03/B11正式举报类型仍待运营版本化交付，只有管理员显式将已交付code/label发布到report_types后才可使用；没有内置“真实”类型或自动生成规则。未修改日常PG/Redis、原凭据或生产资源；真实微信、正式内容供应商、危机案件全流程、注销清理和两端页面仍按后续任务接入，本轮不宣称其完成。

## 验证和交付

先完成整体实现和用例后集中运行测试。初次检查发现命令分派及测试编译问题，修复后相关包通过；拆分文件时补齐time导入后复跑相关检查通过。默认Go缓存写入受沙箱限制，相关/全量检查改用可写GOCACHE；最终构建在授权环境完成模块元数据缓存写入，无缓存权限警告。没有将缺中间件而跳过的日常Go集成用例当作真实通过。

最终`make fmt`、相关包`make check-fast`、完整`make check`（只读格式、go vet ./...、go test -race -cover ./...）、八进程`make build`及32项入口离线测试通过。真实集成在独立Docker项目运行；第一至第三轮make integration均退出0，覆盖原有持久工作、学生卡领域消息链路、心愿生命周期、普通审核、应愿匹配、私聊和故事回归。第四轮验证最终拉黑版本隔离修复，亦退出0；四轮均保留完整输出（导出证据统一去除行尾空白，私有目录保留原始输出）。最终源码之后没有再修改Go或依赖。

新增TestSafetyGovernance包含12组主用例及8个例外退出组合，真实验证PG迁移/权限、HTTP、幂等、双向旧申请不恢复、警告首次起点/同键提前失败重试、固定处罚时长、受限本人申诉、角色及对象授权、普通限制解除不自动上架、通知失败整单回滚、拉黑/处罚分别与同意并发。例外退出组合覆盖matching/realized、拉黑/处罚、作者/应愿人合法主体，均在作者满额、原期限已过的夹具下校验统一withdrawn；fulfilled单独校验拒绝。警告单测使用明确服务器时刻检查29/30秒和向上取整，数据库集成通过调整成对服务器持久时刻构造提前/已满边界，不伪称真实等待30秒。

本轮真实PG事务、受限角色、迁移和HTTP；完整集成同时使用真实Redis和RocketMQ。身份、密钥、举报类型、词库、安全分析及通知失败均为合成夹具；Go race为离线质量检查，真实PG并发通过隔离测试二进制验证。未执行真实微信、正式运营数据有效性、性能指标、危机全流程或生产恢复验收。

源码文件清单和SHA-256见[验证清单](../validation/2026-10-22-safety-governance-r1.json)；完整[集成输出](../validation/2026-10-22-safety-governance-integration.txt)、[质量与构建输出](../validation/2026-10-22-safety-governance-quality.txt)。本轮仅提交推送develop/backend-develop，不合入main，不部署。

隔离项目`liyuanci-safety-a2e0d30a`容器和网络已清理，三个卷及私有凭据保留；没有删除卷、force/prune或日常资源操作。两仓库main保持源码`99a887ca84f2f6d79cb092fd97da6819ed325a57`、docs `2ec198269f9ec772789e62e144954187c77cbd24`。
