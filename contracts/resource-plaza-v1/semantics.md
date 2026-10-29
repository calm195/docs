# 资料广场正式契约语义 resource-plaza/1.0.0

日期：2026-10-29。REQ-023，兼顾REQ-002、REQ-016、REQ-018、REQ-019、REQ-021。依据[需求v1.1](../../requirements/resource-plaza-v1.1.md)及[固定设计](../../design/resource-plaza-v1/README.md)。本文件与OpenAPI、动作索引、规范夹具共同组成正式开发输入，15个接口全部尚未实现。

## 1. 正式化范围与权威

用户本轮要求：“继续把资料广场接口提案整理成正式契约，并补齐后端、管理端和小程序的独立开发工作包。”据此把已采纳方案整理为独立模块包，不覆盖旧基线、固定设计或全站契约。旧提案中的“待正式化”是历史状态；本包是当前Wire入口。不代表AI签发G1/G2/G3、业务编码授权或运行验收。

权威分工：需求定义业务范围；本文件定义行为、规范化、权限和并发；[openapi.json](openapi.json)定义字段及路由；[actions.json](actions.json)定义动作到端点与版本的映射；[examples.json](examples.json)提供共同正反例。冲突必须修订整个未固定交付包，固定后另发新版本，不让各端猜测。所有输入指纹见manifest。

本次明确的提案空缺均是原范围内的技术细化：

- 后台摘要包含content_version、visibility_blocked及feedback_summary，字段白名单以AdminResourceSummary为准；不含URL、提取码或学生身份。
- 创建字段省略默认值、完整PUT的null/空串、精确动作顺序、版本来源及幂等重放状态统一如下。
- 下载返回目标/版本与请求绑定；反馈汇总必须求和一致且只属于当前内容版本；这些关系由本包扩展校验，不能只检查字段类型。
- 输入体最多65536个UTF-8字节，超限413；写入只收JSON，媒体类型错误415。重复字段、非规范数字及规范化后长度错误400。URL补充明确反斜杠、非法百分号编码和端口的处理。
- 当前存在privacy屏障的资料不向普通资料管理查询返回正文或摘要，列表先排除、直接读404；可安全读取的content屏障资料只能在后台修改，不能发布。四类反馈不生成任何屏障或安全案件。

## 2. 接口、主体与数据

服务器前缀 `/api/v1`，路径不包含此前缀。8个GET、7个写命令，固定operationId不得由各端改名：

| operationId | 方法与路径 | 主体 / 版本来源 |
| --- | --- | --- |
| resourceCategoriesList | GET /resource-categories | 学生读 |
| resourcesList | GET /resources | 学生读 |
| resourceDetail | GET /resources/{id} | 学生读 |
| resourceDownloadInfo | GET /resources/{id}/download-info | 学生读；query expected_version＝ResourceDetail.version |
| resourceFeedbackPut | PUT /resources/{id}/feedback | 学生写；content_version及本人feedback.version或0 |
| adminResourcesList | GET /admin/resources | 后台资料管理 |
| adminResourceDetail | GET /admin/resources/{id} | 后台资料管理 |
| adminResourceCreate | POST /admin/resources | 后台资料管理；无目标版本 |
| adminResourceUpdate | PUT /admin/resources/{id}/content | 后台资料管理；AdminResourceDetail.version |
| adminResourcePublish | POST /admin/resources/{id}/publish | 同上 |
| adminResourceOffline | POST /admin/resources/{id}/offline | 同上 |
| adminResourceCategoriesList | GET /admin/resource-categories | 后台资料管理 |
| adminResourceCategoryDetail | GET /admin/resource-categories/{id} | 后台资料管理 |
| adminResourceCategoryCreate | POST /admin/resource-categories | 后台资料管理；无目标版本 |
| adminResourceCategoryUpdate | PUT /admin/resource-categories/{id} | 后台资料管理；AdminCategory.version |

不增加资料举报、资料/分类硬删除、二维码上传、系统内投稿、自动微信发送、反馈用户明细或外部下载代理接口。固定二维码是小程序本地静态联系图，不属于本包HTTP响应。

主体谓词逐请求从数据库和当前会话判定：

| 谓词 | 条件 | 反例 |
| --- | --- | --- |
| student_read | 有效学生会话、auth_epoch匹配、账号active、verified、无有效ban | 游客/无效会话401；活跃但未认证403 VERIFICATION_REQUIRED；封禁/错误主体域403 FORBIDDEN |
| student_write | student_read再加无有效mute | mute仅允许读/取链，反馈403 FORBIDDEN |
| admin | 有效active后台会话，当前角色含review_operator或super_admin | 学生会话、仅crisis_operator、无角色403；撤销/过期后台会话401 |

注销导致会话失效/账号非active按401，不重新发起认证；禁言不使已通过认证失效，解除处罚不免除认证。多角色取允许角色并集。有效ban优先于未认证提示；写反馈的mute优先于对象版本检查。语法解析可先拒绝非法参数，但合法请求须先授权，再判断对象存在/可见性，不可用资源ID枚举泄露信息。

资料学生可见条件：published、分类当前启用、无有效屏障；draft/offline/隐藏/不存在统一404。列表在分页前筛选，同样禁止摘要、计数、游标携带隐藏对象。分类选项也需student_read，仅返回启用项、不带资料数量。

后台查询可读draft/published/offline，但排除privacy屏障资料；content屏障返回visibility_blocked=true及安全内容。任何返回的资料必须引用存在且启用的分类，违反此数据库不变量作为依赖/数据异常503处理，不伪造分类、自动放行或给出publish动作。

## 3. 协议与规范化

成功封装为 `{code:0,message,data,request_id}`。错误封装为 `{code:HTTP状态,message,error_code,request_id}`，没有data或敏感字段；错误代码以每个操作的x-error-codes及responses交集为准。资料/分类创建首次成功和幂等重放均201，其余成功200；重放仍返回当前可授权投影，不能把201误当每次新建。

响应 `Cache-Control: no-store`。不提供304、公开缓存、302网盘跳转。request_id为非空关联标识，message是人类说明而不是客户端分支条件；客户端按error_code处理。可选JSON响应字段均显式返回null/空值，不省略已列出的字段；未知响应字段不得静默作为已支持能力消费。

请求/响应字段白名单。JSON拒绝重复键、NaN/Infinity、非整数数字token（包括1.0、1e0）及孤立代理码点；版本为1–9007199254740991，首次反馈expected_feedback_version可为0。布尔不能作数字。query整数只收十进制规范字符串，不收正负号、前导零、小数或空串；enabled只收true/false；重复/未知query参数400。query解码后键和值合计最多8192 UTF-8字节，超出400；部署网关须容许合法百分号编码的对应传输长度。

写入媒体类型仅application/json，可附charset=utf-8；其余415。body最多65536 UTF-8字节，超出413，不截断解析。所有写入必须恰好一个Idempotency-Key，1–128个可见ASCII字符（U+0021–007E）；客户端使用UUID。GET无body且不需要幂等键。

输入文本必须先规范化再检查业务长度；**OpenAPI中的x-contract-text和x-invariant是本契约强制约束**。通用Schema/类型生成器可以读取结构，但不能声称仅运行标准Schema就实现完整校验。`rules.py`是标准库实现的规范对照器，`validate.py`执行其正反例，不是业务代码或下载服务。

去首尾空白集合固定：U+0009–000D、U+0020、U+0085、U+00A0、U+1680、U+2000–200A、U+2028、U+2029、U+202F、U+205F、U+3000。仅简介先将CRLF/CR改LF；不做Unicode规范化、全半角转换或其他大小写改写。长度按Unicode码点，URL例外按UTF-8字节。响应必须已规范化，不能把输入原串直接回显为权威值。

| 值 | 规范化后的规则 |
| --- | --- |
| title | 单行纯文本，1–100码点；不执行HTML |
| name | 单行纯文本，1–30码点；去首尾空白+ASCII折叠为唯一名称键；展示大小写保留 |
| description | 0–2000码点，允许LF/TAB，缺省/null/全空白归一为空字符串；其余控制字符/行分隔符拒绝 |
| extraction_code | 单行0–64码点，空/缺省/null归一为null，其余保留大小写及内部普通空格 |
| q | 0–100码点，空白即无关键词；内部空白参与字面匹配，控制字符/换行拒绝 |
| reason | 1–500码点，允许LF/TAB，其余控制字符拒绝；仅后台下架理由，非学生自由反馈 |
| download_url | HTTP/HTTPS绝对地址、主机非空，最多2048 UTF-8字节；不得有userinfo、内部空白/控制字符、反斜杠、非法百分号编码或非法/空端口；显式端口1–65535 |

单行值禁止C0/C1控制字符、U+2028/U+2029。链接去首尾空白后保留原串，包括scheme大小写、路径、查询参数、百分号编码和fragment；不解析分享文案、不访问域名、不检测外部链接存活，不追加提取码参数。

创建资料必填title/category_id/download_url，description与extraction_code可以省略。内容PUT必须出现五个内容字段和expected_version：description:null同样归一为空串，extraction_code:null清空提取码；缺字段不是保留旧值。创建分类必填name，sort_order省略为0，enabled由服务端设true；更新分类必须包含name/sort_order/enabled/expected_version。sort_order为0–9999整数。

UUID输入允许大小写，响应小写；响应时间为UTC RFC3339且以Z结尾，小程序和管理端显示北京时间。ID、时间、状态、系统版本不可写。现有权限/状态检查不依赖客户端时钟。

## 4. 查询及响应投影

资料按 `(created_at DESC,id DESC)`，默认20、limit 1–50。分类按 `(sort_order ASC,id ASC)`，默认100、limit 1–100。末页next_cursor=null，空结果items=[]；不提供总条数。后台类别筛选enabled缺省为全部；状态筛选status缺省为全部，不接受字符串all。

q在title或description字面包含匹配，只折叠ASCII A–Z；分类与关键词及状态按AND取交集。特殊字符不是SQL/正则语法，不做分词、拼音、纠错或文件全文搜索。category_id格式非法400；列表筛选所指分类不存在/停用也400，客户端刷新分类重选；写入请求中的合法UUID分类不存在/停用为409 STATE_CONFLICT。

游标有效期30分钟，服务器时间判断，绑定主体、端点、规范化筛选摘要、limit、排序及位置；采用不可篡改且不暴露明文敏感值的令牌。跨域、跨主体、跨条件、变limit、篡改及过期400；每页重新鉴权。查询/分类变化清空旧页，静态数据翻页不重不漏；并发上下架/改类/改词/分类排序可能改变后续集合，不承诺冻结快照。客户端按ID去重并可刷新。

学生摘要只有ResourceSummary列出的信息，简介摘要取前120码点，省略号由UI表现，不计入正文。详情含完整description、download_url、extraction_code、content_version及当前版本my_feedback；my_feedback为null或只属于当前主体/资源/内容版本的Feedback，不返回他人的反馈。学生allowed_actions固定顺序为 `[copy_download,submit_feedback]` 或仅 `[copy_download]`（mute）。

后台摘要增加content_version、status、visibility_blocked、feedback_summary及allowed_actions；后台详情没有my_feedback。反馈汇总必须与顶层content_version相同，total等于四项之和；不展示学生ID、名单、取链人、浏览记录或历史反馈明细。

全部资料content_version≤version。draft的published_at=null，published非null且visibility_blocked=false；offline的published_at可空（从未发布就被适用流程撤下）或为最近上架时间。创建时间不变，更新/重新上架不置顶。

## 5. 写入、动作与版本

| 当前状态/屏障 | 返回allowed_actions（顺序固定） | 状态变化 |
| --- | --- | --- |
| draft或offline，无屏障 | update、publish | 保存保持原状态；显式发布才为published |
| draft或offline，可安全读取的content屏障 | update | 修改不自动解除屏障；publish拒绝 |
| published | offline | offline成功后才能编辑 |
| privacy屏障 | 不返回资料DTO | 受控隐私处理完成前拒绝普通读取/编辑 |

操作前仍重新授权、检查目标及状态；allowed_actions不是命令授权。后台分类更新按管理角色/当前版本授权，类别DTO不另造allowed_actions；创建操作从集合入口按后台管理角色执行。

版本不得混用：资源命令用AdminResourceDetail.version；取链用ResourceDetail.version；反馈用ResourceDetail.content_version及my_feedback.version（无为0）；分类更新用AdminCategory.version。不使用账号版本、时间戳、反馈统计人数或其他资源version代替。

有效内容修改增resource.version和content_version，删除旧内容版本的普通反馈及相关回执。无变化内容保存成功但不增版本/审计/清反馈；分类完全相同值更新同样为无变化成功。上架/下架/适用屏障变更只增resource.version，不清反馈。下架非空理由和业务审计同事务，取消编辑/保存失败不会重新发布。编辑后显式上架更新published_at。

分类停用只要存在任意资料引用就409 CATEGORY_IN_USE，包括draft/offline；不级联迁类、删除或下架。规范名称冲突409 CATEGORY_NAME_CONFLICT，稳定ID和引用保持不变。分类停用与创建/改类/发布共享锁，不能产生资料引用停用分类。

幂等作用域为主体+方法+规范资源路径+键；摘要覆盖规范化完整输入及版本。相同键不同输入409 IDEMPOTENCY_CONFLICT。相同键原命令成功重放时，先复核当前会话/角色、对象读取及适用屏障，再按结果引用返回当前投影，不重执行写入、不回放历史正文；不再用首次expected_version拒绝已成功命令的正常重试。返回版本可高于首次结果，客户端不可推断当前仍是首次发布状态。

不同新键提交旧版本409 VERSION_CONFLICT；版本正确但状态不允许409 STATE_CONFLICT。例如新键重复发布已发布对象或试图直接编辑published，都拒绝。超时重试保留同键同请求，业务409后重读并由用户确认，不自动换键掩盖冲突。

后台资料/分类最小回执按对象生命周期保留，不含正文或链接；学生反馈回执随内容版本终结或学生注销清理。命令对业务对象、审计及回执的提交原子化；保持原命令框架锁序，不通过绕过撤权/注销检查实现幂等。

## 6. 下载信息与反馈

下载GET先检查当前主体及资料可见性，再核对expected_version。资源下架/隐藏为404，仍可读但版本不符为409；不能在版本冲突响应中附新链接。成功DownloadInfo.resource_id与路径ID相同、version与query相同；有提取码copy_text为原URL+LF+`提取码：`+原码，无码时仅URL。“仅复制链接”取download_url。页面再核对主体/请求代次和目标版本才调用系统剪贴板；失败不从旧缓存复制。

服务端取链成功不等于剪贴板成功或下载成功。下架/封禁/注销屏障提交后开始的新读必须拒绝；已先完成授权的交叠请求可能已经发出，不能追溯撤销已送达或已复制的内容。

kind只允许valid（有效）、link_invalid（链接失效）、outdated（年代久远）、incomplete（不全）。无自由文本、附件、目标学生ID或举报type_code。当前有权读取且无mute/ban的学生可提交/改选；不能代别人提交。一个账号在同资料同content_version最多一条当前反馈，初次expected_feedback_version=0，存在则精确等于其version。

提交必须仍可读、content_version相同；内容换版409、下架404、失权401/403。首次反馈version=1，改选加1；同选项无变化成功不增计数/version。已存在更新版时旧不同键请求409，旧成功幂等请求只返回当前同内容版本的本人结果，不恢复旧选择。没有撤销接口，用户可改选。

反馈不增加resource.version，不改变上架状态、屏障、处罚或案件。后台按当前内容版本及active账号聚合四类唯一反馈，注销屏障后即退出统计，随后清普通关联/回执；恢复备份重删，不让已删反馈复活。改内容版清旧反馈归零；无变化保存、单纯上下架或分类改名保留。用户封禁/禁言不追溯删除其既有有效反馈，仍禁止其新写；其注销则按上文退出统计。

## 7. 错误优先与客户端处理

合法请求先处理会话/角色/当前账号资格，再检查对象可见性；对象隐藏优先于版本冲突，不回显其当前version。普通资源命令在当前读授权后识别成功幂等重放，再检查新命令的版本和状态。反馈重放仍须当前可读及同内容版本，换版/注销不能重建已清理结果。

400字段/参数错误；401清会话；403 VERIFICATION_REQUIRED显示认证引导而不注销有效登录，FORBIDDEN清受限内容并保留原申诉入口；404移除旧详情；409依据error_code重读/修正输入，绝不自动覆盖；413/415修正请求封装；429明确重试；500/503不能伪空页或成功。服务端具体错误枚举和HTTP配对以OpenAPI为准，错误不带全文、链接、提取码或学生身份。

网关、APM、SQL及前端日志屏蔽q、正文、URL、提取码和反馈学生关联。数据库/API故障不得降级为游客公开、缓存回放或模拟成功。普通资料读取不建立长期学生行为/下载轨迹；反馈清理纳入REQ-018。

## 8. 校验与运行边界

本包静态工具验证OpenAPI、生成一致性、schema及扩展正反例、HTTP原始输入向量、每个操作成功/错误样例、响应目标/版本绑定、动作索引和manifest。规范对照器不验证生产URL可用、数据库授权/并发、实际去重SQL、隐私worker、浏览器或微信剪贴板/二维码。

执行路径见[包说明](README.md)，独立交付见[总交接](../../design/resource-plaza-contract-delivery-v1.md)。采用本包即可基于一致的固定输入分别规划/实现/测试；是否实施、提交或部署仍按用户授权，不能把本次形成开发工作包写成三端已经完成。
