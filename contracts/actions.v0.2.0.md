# 静态动作索引 revision 5

2026-10-21；T002/T011，REQ-002、015、018、019、020。revision 5登记人工认证六接口的注入式实现：6项后台opt-in、12项身份/学生卡/人工认证注入库、65项未实现。接入见verification.v0.2.0.md；默认server与业务worker尚未装配，真实外部供应商、跨端联调及生产验收均未完成。不新增Wire字段；原卡返回规范化PNG，静态索引不代替当前权限。当前指纹actions-review.v0.2.0-r5.json，r1–r4清单保留历史。

## 历史 revision 4

2026-10-21；T002/T008/T011，REQ-002、015、018、019、020。revision 4仅登记学生卡上传/状态的注入式实现，6项后台opt-in、6项学生身份/学生卡注入库、71项未实现；人工认证、真实供应商及server/业务worker装配仍缺。既有Wire字段不变，补文件媒体/大小边界说明；当前指纹actions-review.v0.2.0-r4.json，r1–r3历史保留。接入见student-card.v0.2.0.md。

## revision 3 历史说明


2026-10-21；T002/T008、REQ-002、014、018、019。revision 3登记学生身份四操作的implemented-injected状态，6项后台opt-in、4项学生注入库、73项未实现；学生server装配及实际供应商仍缺。Wire不变；当前指纹actions-review.v0.2.0-r3.json，r1/r2清单保留历史。接入见student-auth.v0.2.0.md。

## revision 2 历史说明


2026-10-21；T002/T008，REQ-018、019。当前revision 2仅登记账号列表与角色修改的本端实现状态，6项implemented-opt-in、77项not-implemented；不更改Wire，不新增运行授权。当前指纹见actions-review.v0.2.0-r2.json，revision 1清单作为历史保留，不能核验本轮输入。后台接入细节见admin-accounts.v0.2.0.md。审核目标用户已明确采用registry.id精确正文版本，扩展仍未激活。

## revision 1 历史说明


2026-10-21；T002，REQ-002–008、018、019；协调基准c927db0fa2a1b12b1ded49bc77e23991cc80325d。正式交付限静态索引及生成/校验，不变更0.2.0 Wire，OpenAPI/examples保持原指纹。提交完整SHA由后端阶段记录及会话最终回报提供，指纹见actions-review.v0.2.0-r1.json。

## 消费约束

动作标识使用区分大小写的OpenAPI operationId，无事件别名。83条为全协议操作目录，包含GET/登录，不是83个可授权动作。projection只标Me/WishResult上的写提示归属；null不代表许可，也不能在客户端推断一个新投影。路径目标、版本字段与实际当前对象绑定，不能跨账号或对象复用。即使服务端投影包含动作，运行时仍须重新授权、查状态/版本/屏障，索引不能单独授权；79项服务未实现，默认入口关闭。

| 场景 | operationId | 投影及命令目标 |
| --- | --- | --- |
| 上传 | postMeStudentCardAssets | Me当前学生；本地选图本身不受HTTP动作控制 |
| 首次/重提认证 | postMeVerificationRequests | Me当前学生；首次无审核记录省略expected_version，重提用Verification.version |
| 新建草稿 | postWishes | Me当前学生；无现存心愿版本 |
| 改正文 | putWishesIdContent | WishResult当前心愿id及expected_version |
| 删除草稿 | deleteWishesIdDraft | WishResult当前心愿id及expected_version |
| 送审 | postWishesIdSubmitReview | WishResult当前心愿id、expected_version与content_version |
| 上架 | postWishesIdPublish | WishResult当前心愿id及expected_version |

允许示例：Me学生A包含postWishes，仅提示A创建；WishResult心愿A包含postWishesIdPublish，仅提示A上架。拒绝示例：缺失/null/空动作、未知content.scan、Me携带上架、心愿A动作用于B、学生A动作用于B。未知项忽略，不将未知项或null投影解释为可执行；其他已知合法动作可独立判定。当前资格/角色不足403，旧版本409 VERSION_CONFLICT，状态/屏障冲突409 STATE_CONFLICT；资产未就绪409 ASSET_NOT_READY。首次认证条件缺失版本400，不能拿Me.version填审核版本。校验器包含合成跨目标负例，不宣称已验证真实客户端/服务端目标授权。

后台登录roles为快照；每次命令服务端读取当前角色。401清会话及角色后重登，403停止操作且不推导新角色/会话失效；需要菜单刷新时显式重登，无新增会话读取或refresh接口。改密204清当前会话重登；后台绝对到期重新登录，无自动续期。

学生会话独立，撤销/auth_epoch/到期由当前权威判定；后台TTL/体验不套给学生。学生TTL、续期/恢复策略未冻结。资产GET已定义；页面离开取消查询并丢弃旧响应、重入重新GET为客户端技术建议，具体间隔/退避/上限未冻结、页面尚未完成，不把单次API迁移重做为新成果。grade字典/部署TTL待交付；标签创建省略为未填，null不合法；更新省略/清除尚未冻结，不自行启用清除语义。

## B05需用户决定的独立取舍

1. 内容处置目标采用registry.id（精确正文注册资源），还是独立稳定实体级处置资源：影响跨版本身份、限制归属、并发版本和迁移。
2. 新target/allowed_actions字段、案件/目标独立版本模型的兼容发布范围：需新契约版本与两端适用迁移，不直接补入冻结0.2.0。

审核扩展维持draft-not-active；本提交不携带或依赖草案，不新建数据库迁移、不启用真实审核。独立版本列、锁后授权与屏障复核属于必要技术实现，不重新请求已确认政策。

## 验证与未完成

生成器83操作/130 schema，校验器783示例、5原负边界、8新增负例及B07缺失/未知/错误投影/跨目标拒绝通过；构建/校验不访问真实业务HTTP。本轮修改前对比与上一轮八文件指纹一致，保留未激活审核草案和共享plans。后端执行make fmt/make check；实际结果见阶段记录。B07词表子项本端验证通过，整体开发中（学生策略、年级/部署参数、标签语义及两端消费/真实正反例缺）；B14仍部分解除。无部署、无真实联调。
