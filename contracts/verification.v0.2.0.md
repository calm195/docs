# 人工认证申请、重提与后台审核

2026-10-21；T011/REQ-002、015、018、019，关联T005/T006/REQ-020。六个既有API提供implemented-injected库：真实隔离PostgreSQL、受限数据库角色和本端HTTP验证；KMS、私有对象、学校规则为合成适配器。普通server尚未装配，不代表已有可访问部署地址；本轮不考虑跨端联调。依赖wx.login学生会话和扫描通过的本人学生卡。

## 本人申请与重提

统一前缀`/api/v1`、学生Bearer、写请求`Idempotency-Key`。所有响应no-store，标准JSON封装为code/message/data/request_id。

| 操作 | 输入与结果 |
| --- | --- |
| POST /me/verification-requests | 首次`{"student_number":"合成学号","name":"合成姓名","asset_id":"6c500000-0000-4000-8000-000000000001"}`；202返回`{"request_id":"6c500000-0000-4000-8000-000000000002","version":1,"status":"pending"}` |
| GET /me/verification-request | 200本人最新申请的request_id/version/status；没有或不可访问为404；驳回附reason及revision_suggestion，不回显姓名学号 |
| 驳回后再次POST | 保留原request_id，额外传上述GET返回的expected_version；可更换学号、姓名或已扫描通过的本人学生卡，重置为pending并递增版本 |

首次省略expected_version，显式null也为400。已有申请重提必须传申请版本，缺失400，过期409 VERSION_CONFLICT；不能使用Me.version、Asset.version或固定1。仅rejected允许重提，pending/approved使用新键重复提交409 STATE_CONFLICT。每次状态变化递增申请版本，例如申请1→驳回2→重提3→通过4。重提不保留旧意见为当前意见；旧版本决定不能处理新材料。

图片非本人/不存在/删除中404，属于本人但尚未通过扫描409 ASSET_NOT_READY；图片approved仍不等于认证通过。当前禁言/封禁不能申请，403。学校学号/姓名规则经显式Rules适配器验证，不臆造学号格式、去空格或大小写转换；规则不通过400，依赖故障503。当前技术安全上限：姓名256字节、学号128字节、审核原因及建议各2000字节（UTF-8）；这是注入模块的输入资源边界，不是新增业务资格要求。全HTTP请求体仍受既有1MiB上限约束。

同主体、方法、规范路径及键的相同请求重放返回当前最小状态；不同材料409 IDEMPOTENCY_CONFLICT。回执仅存用途隔离HMAC摘要和结果引用。过期回执不保证去重，客户端必须从当前状态重新决定动作；申请状态和期望版本继续保护业务。

## 后台队列、材料与审核

后台Bearer当前角色限review_operator或super_admin，逐次复核数据库角色、会话代次、到期及撤销，不接受客户端角色。crisis_operator单独持有时403。

| 操作 | 实际行为 |
| --- | --- |
| GET /admin/identity-reviews | 仅active账号的pending队列；limit默认20、最大50；items仅id/version/status/kind，kind=identity_review；next_cursor无下一页时为null |
| GET /admin/identity-reviews/{id} | 200 IdentityCase：id/version/status/name/student_number/asset_id；仅案件详情返回完整姓名和学号，成功访问留迹提交后返回 |
| GET /admin/identity-reviews/{id}/student-card | 授权代理返回image/png二进制、no-store、nosniff；无JSON封装、私有对象key或下载URL。图片为上传时规范化后的无损PNG，非原始文件字节 |
| POST /admin/identity-reviews/{id}/decision | `{"decision":"approved","expected_version":3}`或`{"decision":"rejected","expected_version":3,"reason":"合成驳回原因","revision_suggestion":"合成修改建议"}`；200返回Verification |

队列按随机UUID升序分页，游标签名绑定当前后台账号与pending队列，篡改/跨账号400；列表随审核变化，不承诺历史快照。已决定案件可由详情访问；没有额外案件指派模型。后台GET不可写入普通客户端公共缓存。

驳回的原因、建议均必须非空白；只有pending可决定。旧expected_version409 VERSION_CONFLICT，已终结使用当前版本再次决定409 STATE_CONFLICT。同键成功重试仍重新鉴权，仅返回当前结果，不重复审批/绑定。数据库事务提交决定、账号verification和访问留迹；申请时即原子写加密学号和双代HMAC唯一占用，其他有效账号已占用同学号409 STATE_CONFLICT，申请和占用一起回滚；驳回后可修正学号，新旧占用与加密材料原子替换。通过时再次核验学号绑定，并写加密姓名；不一致使整个决定回滚，当前申请继续pending。已通过身份不经此入口改号。通过后Me.verification立即为verified，不需要以本地缓存冒充资格，也不隐含开放尚未实现的心愿或聊天API。

详情、原卡和决定的成功访问写access_audits（后台主体/被访问账号/固定用途/allowed，不含材料）；审计落库失败即失败关闭，事务回滚，原卡不输出明文。失败/撤权/恢复请求保留安全结构化完成日志，未将其宣称为denied/failed业务审计条目。原卡外部读取在锁外进行，整图认证后再锁后复核角色、生命周期、案件及资产版本，留迹提交后才返回；读取期间注销/重提/撤权不会返回旧材料。

## 装配和剩余外部缺口

后端显式执行第十一版迁移及permissions；学生连接使用identity_maintenance组，后台审核使用admin_api组，均不能执行DDL。verification.New显式注入Codec、Binder、Rules、Objects.Open、独立ReceiptKey、Command配置及MaxCardBytes；httpapi.RegisterVerification分别注入学生与后台实例。Studentauth.VerificationRequests仅在路由与适配器齐备时显式开启，Me仅在未认证/驳回且当前允许交互时提示postMeVerificationRequests，pending/verified不提示。

Objects.Open必须读取私有key的不可变对象版本、响应context且不保留材料；服务限制信封读取及整图内存，关闭返回体，不落明文临时文件。身份绑定与双代轮换共享数据库身份锁，先于后台/账号/资产/申请锁；事务内加密和HMAC依赖应有严格超时。真实KMS、学校规则、私有桶执行身份/供应商接入、业务进程装配、生产资源/保留策略及对象物理清理仍未完成；未执行跨端联调或生产验收。后端实施和实测记录见[第七阶段](../../liyuanci-backend-go/docs/milestones/phase-07.md)，不因此关闭共享工作台审批或整体T007/T008验收。

## 验证记录

`python3 contracts/build.py`生成83操作/130schema；在现有独立契约环境运行`contracts/validate.py`通过783请求响应示例、静态动作正反例及认证驳回/版本/媒体边界。系统Python缺依赖时改用既有隔离环境，未更改项目依赖；LibreSSL/RefResolver警告退出0。后端`make fmt/check/build`通过，最终真实隔离项目liyuanci-admin-check-69a0755863fd的人工认证测试1.31s/82.6%，覆盖注册唯一占用、双代更正、审核并发与审计失败原子回滚。本记录不代替跨端或真实供应商验收。
