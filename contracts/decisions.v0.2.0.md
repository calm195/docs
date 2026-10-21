# 0.2.0 用户结论与技术收口

日期2026-10-21（Asia/Shanghai）；T002/T008–T017；REQ-002–008、015、018、019。基准docs `a5e6124dd77c0f539516e550fb790d7ad2bd0195`；G3输入仍为 `ff882ab0c8bdb59d3509e0782c7b13ec77e5c7e4`。本文件记录用户后续明确指令，不修改原审批、基线或设计，不签发新审批。契约静态验证不是业务实施/验收通过。

## 用户明确结论

用户原文：

> B02后台身份通过超管添加；B06 三项都选 A；B07 年级选 A，性别词表为男、女、保密，后台会话选 A。先按这些结论更新契约和阶段记录，继续不依赖未决项的技术补全，不自动提交、推送或部署。

随后补充：

> 账号默认密码123456，登录后可修改

由此确认：后台使用超管预建的本地口令账号；初始密码策略为123456，登录后可修改，不额外设置“首登强制改密”业务门槛。首个超管仍线下初始化，无公开注册。初始口令由仓库外配置注入，代码/镜像不硬编码凭据，不进日志、账号响应或URL。此处是用户政策记录，不是已创建测试账号或可用凭据；尚未实施任何账号创建/重置。

B06三项A：提交完整不可变新快照；被替代版本在既有授权内只读可查；新规则用于后续扫描及正常重提，不自动全量重扫历史。已有举报/巡查/危机处置义务继续有效，归档不等于物理删除或无限期保留，也不开放直接重新发布旧版/一键回滚。

B07：年级为在读年级，具体适用字典由资料方交付；性别显示男、女、保密；标签整体/字段可选且受隐藏设置约束。后台绝对到期重新登录，不提供自动续期；TTL另行锁定为部署参数，学生会话策略不随后台策略自动改变。

## Wire约定与请求响应

### B02：账号、登录、改密

- `POST /admin/accounts` 仅超管，输入 `{"login_name":"synthetic-operator","roles":["review_operator"],"reason":"合成创建说明"}`，携带Idempotency-Key；201返回Account，不返回密码。login_name唯一，重复名称409 STATE_CONFLICT；字段为技术命名，不代表已存在账号。角色只接受既有三种角色，不由登录请求选择。
- `POST /admin/sessions` 输入 `{"login_name":"synthetic-operator","password":"<仅请求内输入>"}`，200返回现有不透明token与Account；401统一失败，不枚举账号或回显口令。登录仍不采用领域写幂等键，登录节流/实际口令摘要适配及部署参数须在实现时验证，不声称已上线。
- `POST /admin/password` 本人当前有效后台会话，输入current_password/new_password，携带Idempotency-Key。先验证旧口令，成功同事务替换摘要、推进认证撤销代次并撤销该账号全部旧会话（含当前），204后重新登录。旧口令错误403 FORBIDDEN，不改变口令或会话；重试若旧会话已撤销返回401而非绕过授权重放。不增加未经确认的复杂度业务门槛，密码哈希/传输/请求体上限仍须按安全设计实现验证。
- token仅内存；绝对到期后401并重新登录，不新增refresh或持久浏览器恢复协议。当前不添加重置密码/改名/自行注册操作。

### B03：本人扫描读取与审核记录版本

新增 `GET /me/student-card-assets/{id}` 返回现有Asset，未知或非本人404；scan_status为pending/approved/rejected，读取只给技术状态，不返回学生卡或安全供应商原文。approved仅图片安全通过，不能自动认证；扫描失败仍失败关闭。

首次不存在identity_reviews时，`POST /me/verification-requests` 省略expected_version；首次创建用账号guard/唯一约束和幂等保证并发安全，不用固定1虚构旧版本。已有审核记录重提必须使用 `GET /me/verification-request` 返回的version，缺失400、旧版409 VERSION_CONFLICT；该版本不是Me.version或asset版本。schema中expected_version因条件依赖数据库状态改为非全局required，但重提在服务端必须校验。无当前记录的GET返回404；不可据此绕过锁后是否已存在检查。

示例：首次请求 `{"student_number":"合成学号","name":"合成姓名","asset_id":"synthetic-asset"}` →202/request_id、version=1、pending；驳回版本3重提带expected_version=3；扫描未就绪409 ASSET_NOT_READY。版本数字仅夹具，未实际调用服务。

### B06：基准与资源版本分离

新增词库详情 `GET /admin/wordlists/{id}`，在既有审核/超管授权内读取entries，draft/published/archived均按当前权限读取；archived只读，不能直接publish。

`GET /admin/wordlists` 每页返回items/next_cursor以及heads。heads固定包含crisis/school/ordinary_violation各一次，每项 `{kind,version,effective_id}`；首次初始化version=1、effective_id=null。version是对应kind的并发基准代次，创建/发布均推进，不是草案资源自身版本；items分页不能让某类基准消失。

- 创建 `POST /admin/wordlists/versions {"kind":"school","entries":["合成完整词条"],"expected_version":1}`：比较heads.school.version，201返回新草案资源id/version/status及base_effective_id；分配新不可变快照，并推进head代次但不改变生效id。entries是完整快照，不能解释为追加。D03正式内容未交付，合成词条不证明扫描有效。
- 发布 `POST /admin/wordlists/{draft_id}/publish {"expected_version":1,"expected_head_version":2}`：前者为草案资源版本，后者为kind基准；锁后比较两者、当前角色及draft.base_effective_id等于当前生效id。冲突409，不能拿最新head强行覆盖基于旧生效版的草案。成功同事务发布新快照、归档旧生效版、更新生效指针并推进相应资源/基准代次。新扫描记录实际使用版本；不重置旧扫描结果为通过。
- 版本冲突重新读取再操作，同键重放仍重新授权。数据库如何持久化head/锁和业务审计是后续实现，不将契约对象当已交付DDL。

### B07：标签映射

`IdentityTags.gender`：male=男、female=女、undisclosed=保密。省略表示未填写，undisclosed是主动选择，二者不互相推断；隐藏标签时不暴露已填写值。grade为非空字符串、语义为在读年级；具体字典未交付，保留该依赖，不编造本科/研究生选项。未填标签仍允许原本允许的无标签发布。

## 兼容性与迁移

采用新契约0.2.0，保留原openapi/examples.v0.1.0.json原文件不改写；生成器/校验器当前指向0.2.0。破坏性边界包括：开放后台输入收紧；Account新增login_name；gender字符串收紧枚举、grade已填写时非空；Wordlist完整快照与head基准、发布双版本及status枚举/返回字段；认证首次/重提条件版本语义。两端须显式升级后接入，不能只替换示例文件。

新增三个操作：本人资产状态读取、后台本人改密、词库详情，操作数80→83。其余待定内容不借本次决策补成事实。B04读卡/业务审计、B05目标动作接线、年级字典、部署TTL、D02/D03外部资源与实际HTTP验收仍未完成；B02/B06/B07仅政策/技术协议收敛，整体阻塞不关闭。所有业务操作仍not-implemented，未执行真实登录/改密/词库发布。
