# 用户管理契约规范语义 1.0.0

本文件与[OpenAPI](openapi.json)、[需求](../../requirements/admin-users-v1.1.md)、[已采纳设计](../../design/admin-users-v1.1.md)合用，REQ-022/016/018/019/021。状态为设计交付，规则细化不等于运行实现。三个GET的字段以本包schema为准，业务范围与旧规则不变。

## 1. 公共协议

统一 `/api/v1` 前缀、Bearer后台会话，角色为 `review_operator/crisis_operator/super_admin`；小程序令牌不能跨域调用，空角色后台账号403，失效会话401。每个请求按数据库当前角色重新鉴权。成功HTTP200，封装 `code=0/message/data/request_id`；失败为HTTP非2xx与非零 `code/message/error_code/request_id`，没有伪成功的空数据。`code`使用对应HTTP状态整数；`message`为展示文字，逻辑判断用HTTP和稳定错误码。所有响应携带 `Cache-Control: no-store` 与 `X-Request-ID`，后者与body一致。

| HTTP / error_code | 条件及前端处理 |
| --- | --- |
| 400 / VALIDATION_FAILED | 参数非法、未知/重复参数、非法UUID、空limit/状态/cursor、超过50码点昵称、游标损坏/过期/不匹配；提示修改条件或从第一页重查 |
| 401 / UNAUTHENTICATED | 未登录/失效会话；中止在途请求并清理当前页资料 |
| 403 / FORBIDDEN | 非后台领域或角色撤销；清除详情与导航，显示无权 |
| 404 / NOT_FOUND | 详情/处罚列表的用户不存在或deleting；列表精确查无此人返回200空页；不说明是否曾注销 |
| 429 / RATE_LIMITED | 原限流；保留条件、停止自动连续重试；不新增限流产品阈值 |
| 500 / INTERNAL_ERROR；503 / DEPENDENCY_UNAVAILABLE | 原服务端/依赖失败，不降级为旧缓存或空列表 |

未知/重复参数一律拒绝，包括重复但相同的值。昵称允许空参数，其他可选参数不传表示无筛选，不接受 `all/null/undefined` 字符串。UUID为标准带连字符的UUID输入，按解析结果规范化成小写供游标绑定；空值非法。时间均RFC3339带时区，输出UTC；前端显示北京时间，不以本机时钟判定处罚到期。版本正整数仅用于乐观锁，不代表内容版本或可操作权。

## 2. 查询与搜索

`GET /admin/users` 参数 `user_id/nickname/verification/restriction/limit/cursor`，所有筛选AND组合，先过滤再截断排序。仅查 `public.accounts.lifecycle=active` 的当前普通资料，昵称源为 `public.accounts.nickname`，绝不关联 `whisper_nicknames`、证据或备份。数据库昵称若无值/全空白，投影为 `display_name=null`，占位“未设置”由前端渲染且不能搜索命中；否则返回原昵称字符串，不擅自改写资料。

昵称关键词去除首尾Unicode White_Space：U+0009–000D、0020、0085、00A0、1680、2000–200A、2028、2029、202F、205F、3000（不含U+FEFF/U+200B），之后省略/空词不参与筛选，非空最多50个Unicode码点。仅ASCII A–Z映射到a–z后做字面连续子串匹配；不使用受数据库区域设置影响的无限定大小写折叠，不做Unicode规范化、拼音、相似度或全文搜索。内部空白、百分号、下划线、引号、反斜杠均为普通字符；使用参数绑定及符合规则的字符串匹配，LIKE方案需转义且校准大小写语义。

昵称可重名，按账号逐条返回；改名仅以当前普通资料为准，老名/树洞名不参与检索。筛选按单次请求同一数据库视图/服务端时间执行，`as_of`在本次所有返回项中一致；跨页非冻结快照。`restriction` 按 `starts_at<=as_of`、未撤销、无结束时间或 `ends_at>as_of` 判有效；有效ban优先、其次mute，否则normal。warning不限制；muted时 `muted_until` 为所有有效mute的最晚结束时间，normal/banned均为null。正好到期时不再有效；危机和内容屏障不映射成账号处罚。

## 3. 分页及游标

用户列表以 `(created_at,id)` 倒序键集，处罚历史以 `(starts_at,id)` 倒序键集，ID按数据库UUID次序；两者均 `limit` 默认20、1–50，取满足全部过滤条件的limit+1条判断是否还有下一页。空列表 `items=[]/next_cursor=null`，末页null，无总数，无页码跳转。上一页由前端保留请求游标栈重取，按当前状态显示；不承诺静态总页数。

游标不可解析为公开标识；有效期自签发起30分钟，超过返回400，使用原有安全密钥配置而非新增默认明文密钥。绑定版本、操作者、端点用途、目标用户（处罚历史）、规范化完整筛选、页大小、排序和末项键。用HMAC保护并采用密钥化筛选摘要或受保护载荷，不能把低熵昵称明文或可穷举的普通hash暴露在可解码游标里。后续页完整回传相同筛选，省略的limit仍按20规范化；不同主体、目标、关键词、筛选、页大小或端点复用均400。每页仍重新检查角色与生命周期，签名不是授权凭证。

## 4. 详情、处罚投影与导航

`GET /admin/users/{id}` 基础字段同用户列表，另外：

| 字段 | 精确语义 |
| --- | --- |
| account_version | 同一读取视图中 `public.accounts.version`，源代码已核对；供原普通用户处罚命令 `expected_version` 使用；提交前重读，并在原案件页核对目标，禁止人工猜值 |
| active_penalties | 只列操作者当前有权读取的有效mute/ban摘要，不含warning及危机不可读记录；可能为空但restriction仍muted/banned，不能由此推算全量数量 |
| allowed_actions | 唯一值数组，仅 `view_penalties/open_case_workspace/open_appeal_workspace`；全为导航提示，不是写权限。始终可有view_penalties；另两项分别在存在当前目标可访问的普通合格违规案件/普通待处理申诉时返回。缺项不显示入口，命令仍重新鉴权 |

`GET /admin/users/{id}/penalties` 返回权限过滤后的历史。过滤必须在limit和游标计算前完成，不返回被过滤的数量、ID、危机标记或存在提示。普通运营不能看危机来源记录；授权人员的危机证据仍须进入案件工作台，用户页不返回危机源或树洞源关联。无权历史为空页，目标账号本身无权/已注销则按公共错误处理。

| 字段 | 规则 |
| --- | --- |
| id/level/kind | 处罚ID与minor=warning、general=mute、severe=ban；不返回作者/内容ID |
| status | 撤销优先revoked；未撤销且有ends_at并已到期为expired；否则active。warning的active仅表示未撤销记录，不等同于限制交互或未确认警告；本页不新增警告确认动作。未来开始记录不进入当前历史投影 |
| starts_at/ends_at/revoked_at | mute结束时间必有，warning/ban结束为空；revoked时间仅revoked状态有值 |
| reason | 安全摘要或null；使用固定处置类型文案，例如“一般违规处置”。不得直接解密输出自由输入reason_cipher，完整理由仅在授权原案件页读取 |
| case_link | 只允许当前可访问的普通举报或普通审核任务引用 `{kind:ordinary_report或ordinary_review,id}`，找不到/历史缺失/权限不足返回null；树洞和危机来源一律null，不能从用户页反查匿名内容归属 |
| appeal_id | 当前可访问的普通申诉ID；多次申诉取最新created_at/id者；无记录、源权限不足或树洞/危机来源为null；原申诉详情二次鉴权 |

处罚列表导航：普通举报可去原 `/safety/penalties?report=<id>`；审核任务进入 `/moderation` 原工作台按ID选择，不能假定旧页面已支持新查询参数；申诉进入 `/safety/appeals`，管理端在本次任务实现选中ID适配器并重新读取详情，不把ID当令牌。普通案件新处罚可从 `open_case_workspace` 进入 `/safety/reports` 选择授权违规案件，必须重新读取并核对 `subject_id` 等于当前用户，处置页再读取当前用户详情。没有案件不能仅凭account_version生成处罚。用户页不提供树洞或危机作者反查导航；处理这些案件从原有专门工作台进入，写契约与版本见[动作索引](actions.json)。

## 5. 既有命令边界与权限并发

本模块不新增写操作。普通处罚复用0.2.1的 `POST /admin/users/{id}/penalties`：expected_version是目标Account.version；violation_ref为符合原命令条件的普通举报/审核任务，content_ref与content_version必须精确匹配目标作者。用户页不返回此类命令的全套参数供脱离案件调用。原理由、幂等键、7天/永久规则、取消/屏障、审计和回执不变。409重新读账号及案件并由操作者确认，不盲目换幂等键。普通申诉的版本来自Appeal.version，决不是Account.version。树洞处罚使用ContentControl.version及ReportDetail.version，完全按独立树洞契约，不套普通罚单。

只读查询也必须遵守原账号注销屏障和读锁/快照协议；基线为注销屏障提交之后新发起的请求不返回普通资料，跨请求旧详情可短暂留在浏览器直到收到失效或刷新，不新增后台长期缓存。详情/处罚查询先核对目标active，禁止从证据/备份回填。撤权后新请求拒绝；前端退出/切换主体时清理内存、取消在途请求并拒绝晚到响应。

## 6. 日志、留迹与兼容

请求查询串出现nickname，网关、应用访问日志、GORM SQL日志、APM、异常上报须按名称屏蔽其值，不记录整URL/带值SQL；前端不写地址栏、埋点或持久存储。列表留迹只记操作者、动作、启用筛选类型、结果数量、时间、request_id，不存整页ID或关键词；详情审计的必要目标引用按REQ-018删除非涉案审计。理由摘要不复制正文，只有正式涉案动作走原证据保留规则。

本包新增三个只读路径及详情account_version，不变更原POST请求/响应，也不向全站0.2.1注入新字段；原输入保持原指纹。部署时新增查询和管理端需要兼容接入，缺接口明确显示尚不可用，不自动切换Mock或绕过角色。开发时使用合成夹具可以独立完成本端，但必须记录模拟范围；本包不证明现有服务器已提供任何新增路径。
