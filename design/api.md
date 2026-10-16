# API契约设计

版本v0.2，2026-10-16。输入为基线v0.2及G2方案B；待G3评审，不提供业务实现。路径/状态码/分页为本次技术设计，REQ规则不因路径命名改变。HTTP服务使用 `/api/v1`，管理端使用 `/api/v1/admin`。

## 1. 通用约定（REQ-001、002、014–021）

- HTTPS JSON，业务成功包为code=0、message、data、request_id；错误包包含稳定字符串error_code及request_id，不能包含SQL、令牌、身份证明或私聊正文。模板两端须据此适配，不沿用演示密码登录为业务需求。
- 身份令牌为不可预测服务端会话令牌，客户端用Bearer携带；服务端仅存摘要并检查subject、代次、撤销/到期及账号状态。后台独立登录域，具体管理员身份提供方/凭据部署由安全配置决定。小程序code只交换微信身份，不直接授予学生认证。
- 所有领域写请求要求Idempotency-Key；同身份、方法/路径、键绑定请求摘要，同键异请求409。相同成功命令重试不能重复匹配/故事/通知；回执只含对象引用，响应重新授权，不重放已删除正文。微信code换取会话采用同code请求去重，已消费且无有效回执时客户端重新获取code。
- 更新已有资源的命令带该目标的expected_version；跨聚合命令另带表中明确的wish_expected_version或expected_write_epoch，分别是心愿版本及会话可写代次，不能混用。创建资源不要求尚不存在对象的版本；涉及既有内容审核还带content_version。需带而缺失400，过期409 VERSION_CONFLICT；数据库事务内再次核验版本。身份资料/公开内容不提供任意批量PATCH状态接口。
- 列表使用不透明签名cursor、limit，建议默认20/上限50作为技术分页参数，负载验证可调整；排序键为时间+ID，聊天after_seq专指最终送达的delivery_seq，不是提交顺序。客户端不能借游标跨账号或提高权限，服务端校验筛选条件；到期/撤下过滤可能少于limit，不能用缓存补回失效对象。
- 游客读取只见公开投影；本人/匹配详情由当前账号与关系判断；审核正文只按案件场景授权。已注销/无权公开对象返回404避免枚举，当前本人状态冲突返回409，角色无权403，令牌失效401，限流429，必要依赖不可用503。
- 异步提交用202表示已持久接收且仍待审/处理，不等于已公开、已送达或全部删除；仅在业务允许与内容通过都满足后返回/展示active、published、delivered。审核操作可返回200“内容通过但执行取消”，不得声称消息已送达。

## 2. 身份、认证与本人资料（REQ-002、014、018、019）

| 方法与路径 | 权限 | 请求关键字段 | 返回/约束 |
| --- | --- | --- | --- |
| POST /auth/wechat-sessions | 持有效微信临时code的客户端 | code、client_request_id | 会话token、本人公开摘要与verification；服务端换取身份，不返回session_key/AppSecret |
| DELETE /auth/session | 当前会话 | 幂等键 | 撤销本会话204，不代表账号注销 |
| GET /me | 登录；封禁仅受限资料 | 无 | 当前verification、处罚提示、允许的动作；不返回完整学生卡/学号 |
| PUT /me/profile | 普通可修改账号 | nickname、hide_identity_tags、expected_version | 本人展示资料，不能改认证状态/学号/角色 |
| POST /me/student-card-assets | 登录可申请认证 | 图片二进制，受限multipart、用途固定student_card | 202 asset_id、scan_status；后端边界检查后加密存储；不返回公开下载链接 |
| POST /me/verification-requests | 登录且可提交认证 | student_number、name、asset_id、expected_version | 202 request_id、pending；卡必须本人且安全扫描通过，待扫描先返回409 ASSET_NOT_READY；不绕过人工 |
| GET /me/verification-request | 本人 | 无 | pending/approved/rejected、驳回原因；学生卡下载仍限审核场景，不开放完整身份回显 |
| POST /me/deletion-requests | 已验证会话身份，包括受罚账号 | confirmation=delete_account、expected_version | 202 deletion_receipt、processing；账号及普通内容立即不可访问，当前会话撤销；删除回执使用专用高熵句柄无身份字段 |
| GET /deletion-receipts/{receipt} | 仅持随机回执句柄 | 无 | processing/completed、可重试技术错误，不返回账号/内容；completed须清理完成，回执过期404 |

图片体积、像素、格式、会话有效期、回执有效期为安全部署参数，在security.md记录候选值及验证要求，不视为业务新增承诺。学生卡加密存储、机器图片安全与学生资格人工审核是三个不同步骤。

## 3. 心愿、公开列表与本人记录（REQ-003–005、008、014、018）

| 方法与路径 | 权限 | 输入 | 返回与规则 |
| --- | --- | --- | --- |
| GET /wishes | 游客可读 | category、campus、cursor、limit | published且当前未过期、作者存续、审核版本合法的脱敏卡片 |
| GET /wishes/{id} | 公众/本人/当前匹配依视图 | 无 | current_state、public或participant投影、allowed_actions；公众无权非公开正文则404 |
| GET /users/{id}/public-profile | 可读公开资料 | cursor、limit | 昵称、未隐藏标签、上架心愿/已审故事；无姓名/学号/学生卡/联系方式 |
| GET /me/wishes | 本人 | state、cursor、limit | 本人草稿/审核/上架/匹配/还愿状态；不把他人注销正文混入快照 |
| GET /me/applications | 本人 | status、cursor、limit | 本人申请状态及当前可读目标，已注销目标不可读正文 |
| POST /wishes | 已认证且未被限制 | category、body、campus、identity_tags?、reward_method?、duration_days? | 201 draft_id/version；可以先存草稿，不未经提交自动公开 |
| PUT /wishes/{id}/content | 本人、状态允许修改 | 心愿字段、refresh_expiry、expected_version | 新content_version；上架先撤下，审核中旧版失效；应愿中/已实现先走合法回退 |
| DELETE /wishes/{id}/draft | 本人且draft | expected_version | 204；不通用于删除已上架或证据 |
| POST /wishes/{id}/submit-review | 本人、认证合格 | expected_version、content_version | 202待扫描/审核，期望版本固定 |
| POST /wishes/{id}/publish | 本人、当前审核通过/可上架 | expected_version | 200 published/ready/expired；满额ready，超时不刷新expired，不绕过处罚/违规/危机限制 |
| POST /wishes/{id}/withdraw | 本人已上架 | expected_version | withdrawn、不公开、旧申请失效；不是任意匹配退出 |
| POST /wishes/{id}/rollback | 本人、允许普通回退 | expected_version、target(matching/published)、refresh_expiry | 已实现→matching保留原人且查B01；matching→published解绑，期限刷新需重审时pending_review，不刷新过期则expired；结果明确而非保证目标一定实现 |
| POST /wishes/{id}/complete | 本人、当前matching且未暂停/限制 | expected_version | realized；会话只读、待审消息取消 |
| POST /wishes/{id}/exception-exit | 合法未受罚方/拉黑方 | expected_version | withdrawn、无当前人、旧会话只读，不占额、不自动刷新；fulfilled返回409 |

所有状态/标签字段先按服务端白名单校验；500码点、校区/分类枚举、1–30整数天及默认值沿用REQ-003。allowed_actions是展示提示，不能代替写时授权。返回ready/expired仍表示命令按已确认规则处理，不将其误报为已公开。

## 4. 申请、聊天与通知（REQ-004–007、014–016、018）

| 方法与路径 | 权限 | 输入 | 返回/规则 |
| --- | --- | --- | --- |
| POST /wishes/{id}/applications | 已认证，非本人，无双向拉黑/处罚 | message≤100码点、wish_content_version | 202 pending_scan；同人未终结去重含待审；不立即给许愿人看留言 |
| GET /wishes/{id}/applications | 许愿人 | cursor、limit | 仅当前active可处理申请及获准公开的申请人资料，不展示待审正文 |
| POST /applications/{id}/withdraw | 申请人、未被确定匹配 | expected_version | withdrawn；后续旧审核不能恢复 |
| POST /applications/{id}/accept | 许愿人 | expected_version、wish_expected_version | 匹配/会话id；事务查资格、期限、拉黑、处罚、唯一应愿人，待审/失效拒绝 |
| GET /me/conversations | 本人有普通历史关系 | cursor、limit | 仅本人可读会话摘要与can_write；无消息正文快照 |
| GET /conversations/{id}/messages | 原双方且未注销 | after_seq、cursor、limit | 仅delivered且delivery_seq>after_seq，按delivery_seq升序limit；返回next_after_seq=末条实际返回序号，空页不推进；旧匹配只读，新人不可读 |
| POST /conversations/{id}/messages | 原匹配应愿中可写 | client_message_id、body、expected_write_epoch | 202 message_id/pending_scan、delivery_seq=null；通过后复核并在送达事务分配序号，不保证提交即送达 |
| GET /me/messages/{id}/status | 发送者且未注销 | 无 | pending/rejected/cancelled/delivered、delivery_seq（仅delivered非空）及可公开原因，不能读对方处罚详情 |
| GET /me/notifications | 本人有效会话 | cursor、limit | 通用进展/关怀与未读状态，目标打开再授权 |
| POST /me/notifications/{id}/read | 本人 | expected_version | 已读；无权读他人通知 |

私聊body大小上限为技术防滥用配置，不擅定业务500字规则；如上线前需要用户可感知的消息长度产品限制，应另行确认。暂不提供消息编辑/撤回、群聊、图片或WebSocket端点。微信通知尝试不是客户端可伪造的发送接口。

## 5. 还愿、分享、黑名单及举报（REQ-008、014–018）

| 方法与路径 | 权限 | 输入/结果 |
| --- | --- | --- |
| POST /wishes/{id}/stories | 许愿人、已实现且可还愿 | body、wish_expected_version；202故事待审且原子转fulfilled；不能空故事直接还愿 |
| PUT /wishes/{id}/story | 原作者、允许修改 | body、expected_version；新版本重审，旧版不继续公开，不回退fulfilled |
| POST /wishes/{id}/story/withdraw | 原作者 | expected_version；故事不公开，心愿仍fulfilled |
| GET /stories | 游客可读 | cursor、limit；只返回当前已审且未撤回/限制/注销的故事 |
| GET /stories/{id} | 当前可读主体 | 脱敏正文/作者公开字段，无已注销应愿人身份引用 |
| POST /share-links | 可分享公开心愿/故事的登录用户 | target_kind/id；返回小程序路由及不透明目标引用，不生成正文快照 |
| GET /share-links/{ref} | 当前访问者 | 重验目标当前公开性；失效404，无旧快照 |
| POST /me/blocks | 普通登录账号 | target_user_id；双向未匹配申请失效、待审消息取消，已有匹配不自动解散 |
| DELETE /me/blocks/{target_id} | 拉黑者 | 解除自己的有向记录，不解除对方记录；旧申请/消息不恢复 |
| GET /report-types | 可使用举报的用户 | 发布的类型清单，类型真实内容待运营交付 |
| POST /reports | 登录且可举报当前内容 | target_kind/id、type_code、description?；202受理，非自动定罪或自动永久证据 |
| POST /me/appeals | 受罚本人；封禁仅申诉专用权限 | penalty_id、body；202待处理 |
| GET /me/appeals | 受罚本人、受限会话可读 | 本人处理状态/允许披露理由 |

还愿故事长度与普通消息一样未在G1定义，技术传输上限需明确为安全配置，不能凭设计写成业务字数事实。对已注销对象的举报仅按仍合法可见的证据入口处理，不恢复普通正文。

## 6. 管理端与案件授权（REQ-002、014–019）

前缀 `/api/v1/admin`。所有操作同时要求后台会话、角色和具体场景权限；禁止仅凭前端路由或任意subject_id解密。

| 方法/路径 | 角色 | 契约要点 |
| --- | --- | --- |
| POST /sessions；DELETE /session | 活跃后台账号 | 登录/撤销独立会话；不使用学生令牌或模板演示凭据 |
| GET /identity-reviews；GET /identity-reviews/{id} | 审核运营/超管 | 列表脱敏，案件详情才能完整字段，记录访问目的和结果 |
| GET /identity-reviews/{id}/student-card | 审核运营/超管 | 服务端代理解密流式返回，No-Store，不签发可复用公开URL |
| POST /identity-reviews/{id}/decision | 审核运营/超管 | decision、reason、revision_suggestion、expected_version；驳回两字段均非空，版本已失效返回409 |
| GET /moderation-tasks；GET /moderation-tasks/{id} | 审核运营/超管 | 仅普通命中案件，明确原版本，不提供任意私聊搜索 |
| POST /moderation-tasks/{id}/decision | 审核运营/超管 | decision、reason、revision_suggestion、expected_version；内容驳回reason和revision_suggestion均必填；返回content_decision与business_outcome分开 |
| POST /contents/{kind}/{id}/offline；POST /contents/{kind}/{id}/release-restriction | 审核运营/超管 | 原因、版本；解除普通违规限制不自动上架，不解除危机隔离 |
| GET /reports；POST /reports/{id}/decision | 审核运营/危机/超管 | 具体案件授权；越权完整身份仍不给普通角色 |
| POST /users/{id}/penalties | 审核运营/危机/超管 | violation_ref、content_ref/version、level、reason、expected_version；轻微映射warning且移除违规内容，一般mute七天，严重ban永久；同违规动作幂等，禁止任意客户端指定不符合规则时长 |
| GET /appeals；POST /appeals/{id}/decision | 审核运营/危机/超管 | 允许解罚须理由，事务撤销处罚，不恢复旧匹配/申请 |
| GET /wordlists；POST /wordlists/versions；POST /wordlists/{id}/publish | 审核运营/超管 | 类型、entries、expected_version；版本化发布，样例核验待运营资料 |
| GET /crisis-cases；GET /crisis-cases/{id} | 危机/超管 | 案件级完整学号/危机正文，记录访问动作；普通运营403 |
| POST /crisis-cases/{id}/actions；POST /crisis-cases/{id}/resolve-false-positive | 危机/超管 | 时间线、处理理由、版本；误报解除再走普通审核，不直接公开 |
| GET /evidence/{id}；GET /evidence/{id}/asset | 危机/超管按案件；普通违规运营仅允许的脱敏案件内容 | 完整学号不因普通违规任务自动向运营开放；学生卡仅本身涉案 |
| DELETE /evidence/{id} | 仅超管 | reason、expected_version；202删除工作，含所有副本及恢复删除标记，不假装立即清理完成 |
| GET /accounts；POST /accounts；PUT /accounts/{id}/roles | 仅超管 | 后台账号角色管理、乐观版本与操作理由；不允许运营自提权 |
| GET /work-items；POST /work-items/{id}/retry | 超管，运营仅所属普通任务的脱敏视图 | 仅技术状态，重驱动再次复核；cancelled不可强制重放为成功 |

普通违规案件保留处置权限不意味着授予危机完整身份；数据投影与security.md角色矩阵统一。后台页面不显示数据库异常/云凭据。未定义的批量导出或私人聊天审计搜索不在首发。

## 7. 错误与异步结果（REQ-004–008、014–019）

| error_code/结果 | HTTP | 语义 |
| --- | --- | --- |
| VALIDATION_FAILED | 400 | 缺字段/枚举/码点/期限错误 |
| UNAUTHENTICATED | 401 | 会话失效，不向客户端返回令牌摘要 |
| VERIFICATION_REQUIRED / FORBIDDEN | 403 | 未认证或角色/场景不符；封禁申诉入口是受限例外 |
| NOT_FOUND | 404 | 不存在或无该对象读权，不用此接口确认他人身份 |
| VERSION_CONFLICT / STATE_CONFLICT | 409 | 版本过期或当前状态不允许 |
| ACTIVE_WISH_LIMIT | 409 | B01回退满额拒绝；审核上架满额则按ready业务结果返回，不混为已公开 |
| DUPLICATE_APPLICATION / BLOCKED_INTERACTION | 409 | 重复未终结或双向交互不允许；不泄露是谁拉黑 |
| REVIEW_PENDING / ASSET_NOT_READY | 409 | 当前不能同意/提交下一步，原异步请求仍可处于202处理状态 |
| RATE_LIMITED | 429 | 技术限流，可重试，不增加业务3条以外的发布规则 |
| DEPENDENCY_UNAVAILABLE | 503 | 必要权威或安全依赖不可用，不声称请求成功 |
| moderation approved + business cancelled | 200管理结果 | 审核通过但交互已失效，不向用户假报已送达 |

任何请求日志只记录路由模板、技术结果与无正文request_id。注销后幂等回执、通知及待审任务不得重建旧数据；已提交业务但客户端超时的重试通过同键识别，仍根据当前授权返回最小结果。

## 8. 契约验收与未决验证（REQ-020、021）

G3前检查所有首发REQ有入口/后台或内部工作映射；REQ-009–013延期无端点。按角色执行401/403/404、版本冲突、幂等同/异请求、业务状态变化后延迟审核、拉黑与同意并发、六行注销及无正文回执测试。小程序微信通知/分享实际可用能力、后台登录方案及执行环境属于阶段依赖；负载数值已按本次授权在performance.md采纳，未实测不声称兼容或达标。


## 9. 评审修订后的明确契约（AR-001–AR-004）

以下依据用户本次采纳授权生效，REQ-007、008、015、016、018、019；不改变批准基线。

### 9.1 聊天送达和游标

消息读取的after_seq与不透明cursor二选一，未传从0开始；cursor只封装会话ID和末条delivery_seq并校验签名，同时传两者返回400。GET /conversations/{id}/messages返回items（含message_id、delivery_seq、submitted_at、delivered_at、当前可读正文）及next_after_seq。消息提交202无序号；message_id仅作待审/幂等跟踪。客户端以delivery_seq去重和排序，每读一页后推进至实际末条，不能用本地发送ID、时间戳、待审计数或服务端next_delivery_seq跳页。A先提交慢审、B后提交先送达时，B序号1先读，A后审序号2下一次after_seq=1可读；回滚不返回序号，重试已送达返回既有序号。并发分页可有后续新页，不漏已批准且当前可读的消息。

### 9.2 警告读取、展示与确认

| 方法/路径 | 权限 | 输入与输出 |
| --- | --- | --- |
| GET /me/warnings | 本人登录，含受罚受限会话 | 未确认warning列表，返回id、version、移除内容的最小通用提示、first_displayed_at、confirmable_at、server_now、remaining_seconds；不是聊天/发布暂停命令 |
| POST /me/warnings/{id}/display | 警告本人 | Idempotency-Key、expected_version；首次写服务端展示时间与+30秒确认点，后续原样返回不重置；客户端弹窗展示后调用 |
| POST /me/warnings/{id}/ack | 警告本人 | 幂等键、expected_version；未display或server_now<confirmable_at返回409 WARNING_WAIT_REQUIRED及剩余秒数；到点200 acknowledged_at；已确认重复返回同一结果 |

remaining_seconds=向上取整max(0,confirmable_at-server_now)，尚未display时30。倒计时基于服务端，不相信客户端时间；29秒不能确认，满30秒可确认。重进保持起点，未确认仍展示；离开/杀进程不能证明持续阅读，也不把警告升级为禁言。同违规处理幂等只一条warning，其他违规可有新warning。提前ack的409不锁死成功回执，之后可再次同键请求；若中间版本变化则先读当前状态。警告接口不能读/确认他人对象。

### 9.3 注销屏障和审核投影

故事列表/详情、作者公开主页、分享打开页及GET /wishes的公开投影统一要求privacy_hold不存在或已由匹配新版本审核释放。应愿人注销事务提交后即使清理工作暂停也返回404/不列出旧故事，不能因作者仍active交付旧public_body。作者本人仅获取privacy_review_required、current_version及允许的重审动作，不以分享入口获得被屏蔽旧公开正文；受控清理/作者编辑需按当前隐私规则处理敏感引用。

公开内容投影统一字段：content_version、school_related、notice_codes、notice_text。school_related=true时notice_codes包含UNVERIFIED_SCHOOL，notice_text为“未经证实”；false返回空提示，判定pending无公开投影。上述字段在列表、详情、作者主页、分享解析后的目标响应一致，不仅在管理端显示。

审核决定驳回分别输入reason与revision_suggestion，均非空；后端落在精确内容版本，作者在GET /me/wishes、GET /me/applications及GET /me/messages/{id}/status等对应状态响应读取review_result（decision、reason、revision_suggestion、content_version）。故事待审/驳回结果包含在本人心愿的story_review_result；身份审核结果也保留已有原因并提供建议字段，不能省略内容驳回建议。

PUT内容/故事生成新content_version，school_detection_state重置pending并重新检测；人工通过必须相同content_version和hold_epoch，旧结果不能解除注销屏障。审核响应区分content_decision和business_outcome（published/delivered/cancelled/privacy_review_required），不把审核通过误报为恢复公开。
