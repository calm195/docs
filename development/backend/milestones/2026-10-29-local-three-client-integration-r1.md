# 三端本地真实联调过程记录 r1（已收尾，局部通过）

日期：2026-10-29（Asia/Shanghai）。性质：实际本地运行与局部真实 HTTP 检查；本记录尚未固定、尚未提交，同一任务后续证据继续补入本记录。未签发完整业务验收或上线批准。

任务：用户要求启动本地环境、允许微信开发者工具及多账号调试，对已实现功能全量联调，允许 subagent。关联 REQ-002、REQ-009、REQ-010、REQ-011、REQ-014、REQ-015、REQ-017、REQ-018、REQ-019、REQ-020、REQ-021；资料广场、用户管理及限制的 REQ 归属以其有效独立需求/契约为准，本轮不新增需求。

共同输入：[原联调手册](2026-10-28-real-integration-runbook-r1.md)、[契约导航](../../../contracts/navigation.md)、全站 OpenAPI 0.2.1／动作 revision 6、whispers/1.0.0、admin-users/1.0.0、user-restrictions/1.0.0及resource-plaza/1.0.1勘误。本轮不改变固定契约、历史记录或批准语义。

docs工作树 `/private/tmp/liyuanci-rp-docs-mini`，分支 `mini-deveop`，完整基点 `804fc5638093f7fd2ecbb0d1b503eb756056471d`；写入前干净。按同一跨端任务可共用 docs 分支的治理条款归档三端证据。实现取舍：复用既有本地服务和私有配置，先核实可运行的页面/接口及鉴权，不为填满验收表而伪造真实学生会话；不通过文档任务编写业务代码。

## 版本与操作范围

后端路径：`/Users/kurous/code/liyuanci/liyuanci-backend-go`；源码分支 `develop`，完整 HEAD `72f926f96227c766047c4ea9251fef3736704634`。开始及检查时工作区干净。本轮未修改业务源码、未提交、未执行迁移、未重置账号或替换密钥，未启停现有中间件。

读取本端规则、索引、真实联调操作册和当前源码启动入口后，使用已有 `.local/local/operations.env` 及其引用配置。昨日操作册中的缺配置快照不代表今日环境：本次发现已配置本地业务测试模式和树洞配置。

## 实际启动与诊断

`make dev-doctor` 成功：数据库、业务结构、Redis、对象目录及已装配本地树洞依赖诊断通过。最初普通沙箱运行无法写 Go 缓存或访问 Docker socket；受审查提升后正常执行。

已执行并保持运行：`make dev-api`、`make dev-worker`、`make dev-content-worker`、`make dev-whispers-worker`、`make dev-evidence-worker`。

| 进程 | PID | 已观察状态 |
| --- | --- | --- |
| API | 6292 | 监听 `127.0.0.1:18080` |
| 学生卡 worker | 6640 | 真实 MQ producer/subscriber 启动成功 |
| 旧内容 worker | 6641 | 真实 MQ producer/subscriber 启动成功 |
| 树洞内容 worker | 6642 | `mq_enabled=false`，数据库轮询、解锁补偿启动成功 |
| 证据清理 worker | 6639 | `scope=evidence` 启动成功，观察日志未显示有删除目标被实际处理 |

已有 `liyuanci-local` Docker 中间件均 healthy：业务 PG 15432、恢复 PG 15433、Redis 16379、NameServer 9876、Broker 10909/10911。它们在本轮前已运行。本轮未新建项目、容器或卷。

停止本组使用匹配配置的 `make dev-stop`；停止保留数据库和卷，不以全局杀进程或清理方式收尾。本摘要记录时服务保持运行，供两端继续联调。

## 31 项真实 HTTP 覆盖

通过现有真实 API 进程发起 31 项检查：7 项 200、22 项 401、2 项 400。公开业务响应和所有受保护业务响应均观察到 `Cache-Control: no-store`；健康端点不要求此业务缓存头。空登录请求只验证输入校验，没有调用伪造微信身份或注入学生令牌。

| 方法 | 路径 | 实际状态 |
| --- | --- | --- |
| GET | `/healthz` | 200 |
| GET | `/readyz` | 200 |
| GET | `/api/v1/me` | 401 |
| GET | `/api/v1/me/wishes` | 401 |
| GET | `/api/v1/me/applications` | 401 |
| GET | `/api/v1/me/conversations` | 401 |
| GET | `/api/v1/me/notifications` | 401 |
| GET | `/api/v1/me/blocks` | 401 |
| GET | `/api/v1/me/interaction-blocks` | 401 |
| GET | `/api/v1/me/appeals` | 401 |
| GET | `/api/v1/me/care-cards/1` | 401 |
| GET | `/api/v1/wishes` | 200 |
| GET | `/api/v1/stories` | 200 |
| GET | `/api/v1/resources` | 401 |
| GET | `/api/v1/me/whispers` | 401 |
| GET | `/api/v1/admin/users` | 401 |
| GET | `/api/v1/admin/accounts` | 401 |
| GET | `/api/v1/admin/moderation-tasks` | 401 |
| GET | `/api/v1/admin/wordlists` | 401 |
| GET | `/api/v1/admin/crisis-cases` | 401 |
| GET | `/api/v1/admin/reports` | 401 |
| GET | `/api/v1/admin/appeals` | 401 |
| GET | `/api/v1/admin/resources` | 401 |
| POST | `/api/v1/auth/wechat-sessions` | 400 |
| GET | `/api/v1/me/verification-request` | 401 |
| GET | `/api/v1/whispers/config` | 200 |
| GET | `/api/v1/whispers/help` | 200 |
| GET | `/api/v1/whispers/posts` | 200 |
| GET | `/api/v1/me/whispers/capsules` | 401 |
| GET | `/api/v1/admin/whispers/reviews` | 401 |
| POST | `/api/v1/admin/sessions` | 400 |

原始结构化证据：[31项HTTP检查](../validation/2026-10-29-local-three-client-http-r1.json)；[进程快照](../validation/2026-10-29-local-three-client-processes-r1.json)。证据仅保留路径、状态、响应大小及缓存头判定，不保存正文、口令、令牌或个人数据。

## 真实与本地替代边界

【事实】真实部分为本地 Go API/worker、PostgreSQL、Redis、MQ 连接及真实 HTTP 往返；受保护 API 在无会话时拒绝访问。上述 31 项不覆盖登录后的业务写链，也不证明双账号隔离、页面操作或微信真机验收。

【事实】当前 `LocalTest=true`，本地单 DSN 模式；树洞日志为 `manual_review=true`、`external_gateway=false`、资源版本 `local-business-v1`。人工审核、本地密钥/日志及开发适配边界仍存在。学生卡扫描是开发模拟，不记作真实扫描供应商通过；真实外部通知、KMS/全版本对象清理、正式关怀资料和独立灾备未在本轮证明。

【事实】后端微信 AppID/Secret 字段均非空；只确认配置存在，不输出值，不据此断言其有效。初始只读配置核对不能证明登录；后续已通过开发者工具完成A及替换后的真实B登录，见本记录新增双账号链证据。后台默认账号入口及私有配置字段路径已向管理端执行者交接，未在报告中保存口令或令牌；管理端自己的真实登录及页面证据由该执行者另行提供。

## 账号隐私清理授权与启动

【实际拒绝】自动审批拒绝 `make dev-privacy-worker`：该进程会连接隐私维护配置并消费现有账户删除/证据清理队列，可能造成不可逆数据删除；现有本地联调授权未明确涵盖对既有数据执行隐私删除。未通过其他入口或间接执行绕过拒绝，账号隐私 worker 未启动。

【后续授权与执行】用户随后明确回复“批准消费本地既有注销队列”。据此执行 `make dev-privacy-worker`，2026-10-29 20:48:36（Asia/Shanghai）日志确认 `scope=account`、`recovery_only=false` 启动成功，`recovery.reapply`、`intent.reconcile` 及连续多轮 `cleanup.next` 均为success，进程保持运行。此前拒绝记录保留为历史事实，当前启动授权阻塞已解除。轮询操作成功不代表存在待办或所有删除已完成，本轮尚无特定回执最终状态证明；见[启动证据](../validation/2026-10-29-local-three-client-privacy-worker-r1.json)。

【未完成】后续虽有真实A/B局部写链，仍未完成全功能、双设备、账号删除完成、外部依赖及灾备完整验收，不能由上述局部检查推导通过。本摘要不关闭 RI/WI 全项验收。


## 管理端与小程序当前进展

【事实／管理端执行者回报及脱敏证据】管理端源码 `develop`，完整HEAD `cfd9678d4d46a3e331551220a5a3a4c768ac8991`；Vite `127.0.0.1:5173` 代理本地18080。真实后台登录、19条路由遍历、15次列表GET均200及退出204已执行；不包含对既有业务数据的处罚、审核或删除。见[管理端脱敏证据](../../admin/validation/2026-10-29-local-three-client-live-r1.json)。无请求的证据、删除回执等输入型页面只证明页面可打开，不能写成对应业务查询或删除完成。

【事实／管理端补充写链证据】已使用本轮专属资料完成页面创建→发布→下架→编辑→重发→最终下架，3组动作均成功；真实HTTP创建201、读取/发布/下架/编辑200、退出204，共22次请求。见[资料页面写链](../../admin/validation/2026-10-29-local-three-client-resource-live-r1.json)。该阶段先保持下架，后为B学生页面回归重新上架，完成反馈后再次下架，最新状态以下文补证为准。另有本轮新建的3个空测试分类已停用，停用返回均200，见[分类收尾](../../admin/validation/2026-10-29-local-three-client-category-live-r1.json)；该JSON只保存最终停用结果，不用它单独证明分类创建/编辑/排序全链通过。本轮未删除既有数据。

【事实／主执行者实际工具操作交接】小程序已将 `codex/prototype-refresh` 快进到 `develop`，完整HEAD `c95feabb49041a6b0b456eeb0b9663fb0b86f6c5`；200项单测通过、开发构建完成，微信工具新首页已核验。生产小程序构建同样通过，见[生产构建日志](../../miniprogram/validation/2026-10-29-local-three-client-build-r1.txt)及[小程序脱敏证据](../../miniprogram/validation/2026-10-29-local-three-client-live-r1.json)。uni statistics缺Appid警告是统计配置提醒，不影响该次构建成功，不据此推断微信登录或业务验收。

【事实／真实A已登录】主窗口s0使用开发工具当前登录的真实微信作为A，已在真实页面微信登录成功，个人中心显示已认证；胶囊列表及已解锁胶囊详情可读取；`pages/care/index` 无关怀卡片、`pages/safety/index` 本人警告暂无未确认/本人申诉暂无记录空态正常。这些只证明导航和读取，不含关怀或安全处置。曾使用的虚拟s1/s2及B窗口已关闭回到主窗口，不保存账号名、个人资料、胶囊正文或会话令牌。

【历史事实／首个真实B权限阻塞】最初用户添加的真实测试微信B，两次点击均在 `uni.login` 的fail阶段失败，没有发出该次后端 `/auth/wechat-sessions` 请求。初次仅从页面错误文案定位本地阶段，之后主执行者 Raise B窗口并加载debugger，以控制台 `wx.login` 仅打印fail.errMsg，取得确切错误：`login:fail 登录用户不是该小程序的开发者, [20261029 20:41:45]`。未打印成功code/openid/token。已请求用户在微信公众平台为B添加该小程序开发者权限；该事实取代此前具体errMsg待查的临时诊断。不应将该失败归因为后端Secret或微信网络拒绝。

【后续事实／替换B成功】用户替换真实测试B并添加该小程序开发者权限，真实微信页面登录成功。B认证前资料读取及树洞发帖被拒绝；使用合成PNG、开发扫描与虚构测试身份提交认证，后台案件 `6e60ddba-a199-4812-9e94-f6e0f897af1b` 批准后本人状态已认证。B本人心愿、胶囊初始列表为空，不混入A内容。该测试证明本地资格流程，不证明学校权威资料或真实扫描供应商通过。历史首个B权限阻塞已由替换账号解除，不再作为当前阻塞。

【真实局部业务链】A本轮心愿 `84fc4c57-c95a-4f1e-a81b-4352ff1545a0` 草稿→送审→后台批准ready→上架；提交/上架使用工具控制台调用现有tap处理器诊断，不写成纯点击验收。B因公共列表缺陷经 `wx.navigateTo` 诊断直达详情后，以真实页面应愿；后台批准active，A页面确定唯一匹配。A/B真实页面双向聊天，后台分别批准delivered，A页面确认同时显示双方两条已送达消息。A树洞 `5b5a525d-e6f1-42af-9713-afbe52597cc8` 通过纯页面保存/提交，后台published，B页面可读；B抱抱计数0→1→0，暖评 `c339ca86-1da4-4f83-88a1-25ebb9e37fbf` 页面提交后后台published；B通知未读2→1。见[双账号页面脱敏摘要](../../miniprogram/validation/2026-10-29-local-three-client-dual-account-r1.json)，其引用8份同轮后台审核证据，不保存正文、真实姓名或会话凭据。

【实现与故事补充】A真实页面确认实现，状态变为已实现；故事提交确认后已还愿/审核中、输入清空。后台故事案件 `737ef429-5037-4c76-8ac3-be6d585930fc` 已批准published、案件版本2→3；[后台证据](../../admin/validation/2026-10-29-local-three-client-story-a-r1.json)、[只读资源映射](../validation/2026-10-29-local-three-client-story-map-r1.json)表明故事资源沿用本轮心愿ID。后续A真实页面已读取公开故事，生成分享引用并解析出正文成功；B也从还愿墙正常页面入口读取本轮A故事，非诊断直达。A真实页面撤回故事，提示已受理，心愿仍为已还愿；再点当前公开故事，UI不可公开查看，GET故事详情404，无正文。随后只读按本轮target定位1个分享引用并回读同样404/NOT_FOUND、无data/正文，见[撤回后分享重验](../validation/2026-10-29-local-three-client-share-withdrawal-r1.json)，不保存引用值。未实际发给联系人，不记微信好友分享投递通过。

【本轮新胶囊到期】B页面封存胶囊 `245babb4-2bae-45b6-810a-64d253a96539`，成功后输入清空，后台批准为capsule_locked。服务端21:18:56早于预约21:19:35，未返回正文；21:19:39刷新详情已解锁且正文可读；列表仍仅状态与预约时间，不回显正文。证明本轮分钟级页面封存/批准/到期读取，不替代59/60秒、365天精确边界、停机补偿或通知失败场景。

【资料学生闭环与收尾】本轮测试资料重上架后，B认证读取，搜索专属标记唯一命中→详情→复制下载信息显示已复制→有效/链接失效/年代久远/不全依次反馈均显示已保存。后台核对同一B最终反馈total=1、incomplete=1，其余0，随后真实页面下架200、版本7→8。见[重上架](../../admin/validation/2026-10-29-local-three-client-resource-publish-r1.json)、[反馈核对及最终下架](../../admin/validation/2026-10-29-local-three-client-resource-offline-r1.json)。不把复制提示等同于外部下载地址实际访问通过。

【新增页面负例与状态恢复】A仅用 `wx.navigateTo` 导航到B本轮胶囊详情，真实请求 `GET /api/v1/me/whispers/capsules/245babb4-2bae-45b6-810a-64d253a96539` 返回404，页面显示内容不存在或当前不可访问，无正文。B隐私标签hide保存后恢复原show，均有真实API与确认框；主题dark切换后恢复light。黑名单空态正常，不等于屏蔽创建/解除通过。实现后B匿名会话列表只读、聊天只读且发送disabled；资料下架后B搜索本轮专属标记为空。

【昵称与旧快照】B原无已审昵称，真实页面候选送审，经[昵称批准](../../admin/validation/2026-10-29-local-three-client-nickname-b-r1.json)激活；新帖 `0efd5075-f42c-49bc-9e5f-67519f43a1dc` 已选昵称预览→保存草稿→显式送审，经[新帖审核](../../admin/validation/2026-10-29-local-three-client-whisper-nickname-b-r1.json)published，B广场显示昵称。此前暖评 `c339ca86-1da4-4f83-88a1-25ebb9e37fbf` 仍为随机匿名，不随新昵称变更。报告不保存昵称文字；违规昵称撤销与慢清理未测。

【关闭评论与通知回流】A在本人树洞editor关闭评论，按钮变恢复；A通知含本轮暖评未读，标已读后2→1，目标重验回流详情显示暖评1/抱抱0、已公开B暖评仍可读并提示评论已关闭。B同页无写暖评入口。仅正常关闭子项通过，未测关闭与批准竞争或恢复不补发。

【岗位与队列】新增测试审核岗、危机岗分别可访问本岗，对跨岗及账号管理返回403，见[角色边界](../../admin/validation/2026-10-29-local-three-client-roles-r1.json)；[初始审核队列聚合](../../admin/validation/2026-10-29-local-three-client-review-queues-r1.json)仅是当时状态。账号privacy已获明确批准启动；后续只读[运行/队列聚合](../validation/2026-10-29-local-three-client-queue-status-r1.json)确认六类进程alive、healthz/readyz200、deletion_jobs无记录、work_items仅completed=8。本轮未创建特定注销/证据删除待办，不能把空队列算删除完成。

## 本轮收尾状态与失效重验

【实际通过子项】A真实页面先恢复本轮树洞评论，按钮回到关闭评论，再撤回 `5b5a525d-e6f1-42af-9713-afbe52597cc8`，状态已撤回并提示需显式提交；公开详情GET404，无正文。A重开树洞通知，点本轮已读暖评通知触发目标重验，同样404并提示内容不存在，不回显旧正文。该结果证明本轮撤回及通知失效重验子项；不代替关闭与批准竞争、改稿重审通知去重或所有WI断言。

【最终测试资源状态】B昵称帖 `0efd5075-f42c-49bc-9e5f-67519f43a1dc` 保持published；B胶囊 `245babb4-2bae-45b6-810a-64d253a96539` 保持已解锁；A故事 `84fc4c57-c95a-4f1e-a81b-4352ff1545a0` 已撤回，A心愿仍fulfilled；本轮资料 `7d60d51b-1ae8-4521-a7a6-37fd812e3c24` offline。未扩大为删除本轮或既有数据；API与workers保留运行。

【结论】已执行子项、未执行断言及实际失败/阻塞分别见覆盖矩阵。本轮仍未全量通过：半匿名/援助/举报资料配置阻塞，公共心愿列表前端缺陷未修，opaque动作投影仅为接入疑点；无真机、性能、独立灾备或本轮新账号注销完成证据。记录保持进行中/阻塞，未固定、未提交，不签发完整验收。

## 当前问题与未覆盖范围

【已定位、未修】心愿公共列表与首页空。匿名HTTP公共列表200并含本轮已上架心愿，详情200；契约OpenAPI0.2.1及后端公共页items为扁平PublicContent。小程序 `api/wishes.ts` 将它当WishResult，列表及首页调用 `publicWishBody` 要求current_state=published并读取public.body，实际全部过滤。见[脱敏可见性诊断](../validation/2026-10-29-local-three-client-wish-visibility-r1.json)。本轮未改源码，不通过改后台或伪造状态绕过；B诊断导航只是继续独立业务链，不代表正常广场入口通过。

【环境资料缺项／未修】[只读catalog诊断](../validation/2026-10-29-local-three-client-catalog-missing-r1.json)确认树洞config200、report_types为空、semi_available=false、grade字典version=null/items空、help unavailable/items0；私有CatalogFile/Contact及旧业务Care均未配置。B举报页可读当前公开来源，但举报类型资料尚不可用，无法提交。数据库report_types总数/已发布均0，opaque_enabled=true。树洞举报展示来自Catalog.Reports，写入仍要求数据库published类型；普通安全举报类型直接来自数据库，不同于catalog。树洞Grades/Reports/Help共用catalog，危机关怀是同资源文件独立Care字段；旧业务Care另配，不能称全部缺口来自同一catalog。未填充虚构正式资料。

【动作投影疑点／未修】interactionBlockCreate不是catalog字典字段；目前仅/me动作追加该能力，后端PublicPost/PublicComment未附该动作，而前端详情按这两个投影判断按钮，可能使页面屏蔽入口不可达。只读源码定位与空态不足以证明实际写授权故障，不冒称已完成屏蔽/解除或修复；未改配置、业务代码或不可逆开关。

【待执行】完整WI负例、半匿名字典/昵称违规治理、评论关闭竞争、抱抱并发旧版本、通知去重/失效、opaque兼容、危机岗位内容隔离、取消/重驱动、专号注销/限定证据删除、恢复灾备、双设备/弱网/双主题、实际微信好友分享投递、容量。真实双账号局部归属和写链已有证据，但全部双账号隔离/越权断言尚未全覆盖。见[当前全功能与WI覆盖矩阵](../validation/2026-10-29-local-three-client-coverage-r1.md)。后续继续复用本未固定记录。

## 变更、风险与验证

本次新增本过程记录、三端脱敏validation证据及覆盖矩阵，更新对应索引入口；固定清单不变。主要风险为心愿公共列表前端schema缺陷未修、开发适配与正式依赖不同，账号隐私worker已获批准并启动但无特定删除待办/最终状态验证。上述边界限制相关完整验收结论，不阻断其他具备条件的测试。

实际验证：`python3 scripts/check_documents.py` 通过（701个固定文件、75个来源映射）；`git diff --check` 通过。本记录目前进行中，完成交付后再按治理规范登记固定；不自行提交、推送、合并或部署。

## 用户授权后的修复与回归（进行中）

【用户明确要求】修复公共心愿列表与屏蔽入口，补齐本地配置，聊天改为对话式并静默更新；文字审核先按词库筛选，无命中自动通过，命中进入对应流程，并初始化常见词。此次授权包含业务实现修改，未授权提交或推送。

【实现与验证】小程序工作区已修复公共投影适配、Workspace屏蔽权限、聊天气泡与滚动状态；205项测试和微信构建通过。消息方向增量见[聊天读取者投影](../../../contracts/chat-viewer.v0.2.1-r1.md)。后端修改及真实双账号回归仍进行中，不沿用前轮结果宣称新版已通过。

【本地配置】新增明确标注测试的年级与举报类型；求助资料仍unavailable。词库通过后台版本接口初始化，保留旧词；危机8、涉校9、普通违规12，重复运行未新增版本。配置及词库不代表正式资料审核。

【新版真实回归进展】A/B真实微信登录后，新心愿1cd91d01-0fc3-41b5-8f65-de4b9f46a181从首页正常读取，页面创建/提交后自动ready，A上架，B应愿自动active，A匹配。会话3c113760-c459-4ede-a31c-2eafe198f001双向消息自动送达序号1/2；双方页面验证我/对方方向，未发送输入跨轮询保留。半匿名测试帖8420896b-8730-46ef-9294-3816143e341e使用本地测试字典自动published。后台只读证据确认wordlist-first-v1且无人工审核者。

【屏蔽修正】首轮客户端修改后真实页面仍无按钮，进一步修复后端Workspace漏投影；真实PG覆盖开关/已认证/未认证/处罚。API更新后A成功屏蔽B测试帖发布者，正文清除；设置opaque列表出现已屏蔽对象1，随后解除归空。公共列表仍可读符合既有设计：屏蔽阻止新增互动，历史内容不因此隐藏。

【配置回归】本地测试举报页面可选择并成功受理，举报45bd7282-d736-44e4-8575-af7b96430882。管理端新版此轮核对为真实HTTP/DB技术只读，尚未重新完成浏览器登录，不冒充页面证据。新版全量真实回归仍进行中。

【命中回归】涉校帖a9b97874-7cd7-45ca-9ae8-29e34088e978由真实页面提交后human_required，后台HTTP人工批准2→3后published。普通违规帖42f90cb2-070b-4b17-82a7-aaea6e624810命中刷单返利，human_required后真实HTTP拒绝2→3、从未公开，页面呈现理由及修改建议。创建/提交触发10分钟5次限流，按Redis窗口等待后重试成功，未清键或改限制。小程序最终205测试通过。

【危机回归】同一专用违规测试帖改稿正文2后，页面显示安全隔离且正文隐藏。危机任务c2989f2d-8bdf-44ac-8630-2f6859c89ed5，案件cfd5f8fa-282e-4a60-8b74-648de7d4837c，危机岗200/普通岗403，无公开版本；Care和staff通知pending，未调用真实外部通知。未解除危机限制。

【交付状态】公共心愿、屏蔽、聊天静默更新、词库优先审核已实现并完成上述本地回归；新版全量真实页面验收仍未完成，详见覆盖矩阵末节。源码未提交，HEAD基点不变；本地API、worker及前端环境保留运行。正式援助资料不可凭空补齐，管理端新版页面登录与真机/外部依赖仍是验收边界。


## 最终收尾说明

用户已明确授权关闭服务、提交和推送。此前“进行中/未提交/保留运行”为对应时间快照，最终状态以[收尾、缺陷与优化清单](../validation/2026-10-29-local-three-client-closeout-r1.md)及本轮精确提交记录为准。交付归档后固定；全部WI仍非全量验收通过。


## 精确源码提交与最终交付

后端 develop：`183d2f3675a3882d2f4b53aaa9f3b5c85933f0b1`，已推送origin/develop；小程序 develop：`85777112c721d89adffc083947321590ce02e270`，已推送origin/develop，包含此前重构合入基点。两端工作区干净。管理端 develop：`cfd9678d4d46a3e331551220a5a3a4c768ac8991`，本轮无源码变更、不制造空提交。docs使用同一跨端任务分支mini-deveop归档，未合并main。

【最终验证】源码最终指纹与已通过检查快照一致；后端fmt-check、diff检查通过，小程序205测试和构建通过。docs交付运行check_documents.py与git diff --check，并追加本轮新记录指纹；历史固定条目不变。私有.local仅保留本机，不提交凭据。本记录及证据固定只表示本轮交付归档，不代表全量联调、真机或生产验收完成。
