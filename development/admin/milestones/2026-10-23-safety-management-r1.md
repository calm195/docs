# 举报、处罚与申诉管理真实接入

## 授权、快照与状态

2026-10-23（Asia/Shanghai），任务T028，关联REQ-014、REQ-016、REQ-018、REQ-019。用户要求继续开发举报、处罚和申诉管理、直接对接后端最新接口、不保留Mock，随后授权按模块与依赖提交推送。沿用此前“无需验证”指令，本轮不运行测试、构建、文档检查或实际联调，不宣称验收通过。

管理端`develop`，开工基点`cc0193bba6de30d1a8be0c08c8852a94ea62b3fd`且包含前序未提交工作；按依赖先提交前序身份审核、内容词库和纯真实后台入口。T028客户端提交`5f58fb87c57b3230d50fa0cacd1a20783e8723c5`，页面/权限/说明提交`fcf894149de1e27966cc45833c7ceff743da5b3a`，源码提交后工作区干净。完整模块映射见[精确提交补充](2026-10-23-module-commits-r1.md)。

docs `admin-develop`独立工作树，基点`3d1d1f395128d8bb0d1a1bc692b04095eea3f12e`；保护已有前序记录。后端最新只读核对`develop`完整提交`d4b70f906818a83f13609f305a78480241bf3355`，工作区干净；未修改、提交或推送后端。本轮没有部署、合并main、运行数据库迁移、创建学生/案件或实际施加处罚。

## 已实现页面与依赖

新增懒加载`/safety`和“举报、处罚与申诉”菜单。review_operator、crisis_operator、super_admin均可进入普通安全治理；服务端每次重新鉴权和筛选普通案件。现有身份/内容审核仍按原审核运营/超管入口，后台账号角色管理仍仅超管，未扩大其他模块权限。共享工作区支持指定多个可选角色，菜单和路由用相同规则；没有以菜单替代服务端授权。

- 举报/申诉各自游标分页，默认20条；首页刷新、上/下页、加载、空列表、失败重试。列表仅保存技术编号、版本、状态和可选内容类型，不保存举报人、正文、说明或完整学生身份。
- 按需读取授权详情。举报展示后端允许的精确正文、说明、类型代码、目标账号与内容引用；空正文合法，提示可能已换版、注销或受屏障保护。申诉展示申诉正文及原处罚理由。不提供任意学生/私聊搜索或导出，不把原文写入存储/日志。
- 举报pending/processing可确认或驳回；分别提交confirmed/dismissed和举报独立版本。已确认resolved举报可作为本页处罚来源，目标账号、violation_ref、content_ref、content_version均锁定详情返回值，不允许编辑或从案件ID推算。
- 处罚minor=警告并移除违规内容，general=固定7天禁言，severe=永久封禁，无任意期限字段。当前账号版本必须从授权交接取得，输入正安全整数后才能确认；不填则禁止提交，不以举报、正文版本或固定1代替。
- 申诉pending可维持uphold或撤销revoke，提交申诉自身版本，所有操作理由必填并二次确认。撤销仅对应原处罚，不承诺恢复旧申请、匹配、上架或送达，也不解除其他处罚、普通内容限制、危机或隐私屏障。
- 举报上下文支持普通内容offline/release-restriction，路径绑定详情target_kind/target_id；不是registry ID或举报ID。需由授权交接提供当前内容实体版本；wish/story用所属心愿聚合version，application/message用各自version，均不使用content_version。界面明确解除限制不自动公开或恢复旧交互。
- 相同命令网络失败重试复用幂等键，输入变更重新核对；写入409清除旧确认/版本和理由、重新读取案件，不自动重发旧命令。404清案件，401清内存会话，403清页面并拒绝。切换案件/标签、离页、换会话及本地撤权取消请求并丢弃旧正文/回执；没有运行时假数据或降级演示。

## 实际接入接口

统一前缀`/api/v1/admin`，后台Bearer，no-store、credentials=omit、redirect=error、AbortSignal。请求前、响应后、读体后复核当前授权与取消；以unknown校验标准成功封装和白名单字段，非200只保留HTTP状态，不显示后端错误正文。写入保持调用方Idempotency-Key。

| 接口 | 输入／返回边界 |
| --- | --- |
| GET /reports、/appeals | limit/cursor；技术分页，next_cursor可为空 |
| GET /reports/{id} | 最新后端具体普通案件投影，检查返回ID，body/description允许空、reason允许null |
| GET /appeals/{id} | 申诉正文、penalty_id、penalty_reason和最小状态，检查返回ID |
| POST /reports/{id}/decision | confirmed/dismissed、reason、举报expected_version；200最小回执 |
| POST /users/{id}/penalties | violation_ref/content_ref/content_version/level/reason、账号expected_version；200处罚自身ID和version，不能拿账号路径ID校验处罚ID |
| POST /appeals/{id}/decision | uphold/revoke、reason、申诉expected_version；200最小回执 |
| POST /contents/{kind}/{id}/offline、/release-restriction | reason、实体expected_version；200核对返回实体ID和kind |

共享正式契约保持0.2.0/revision 5原字节；两个详情辅助入口不在原固定OpenAPI中，以已交付后端T026记录及最新源码为消费依据，不自行生成或批准共享新版本。此前T017记录认为下线/解除未交付的描述保持历史；本轮核对后端安全治理已提供两项接口，故在真实普通举报上下文接入，不恢复旧演示目录。

## 未完成边界与可测试验收

事实：现有举报详情不含subject/account version，也不含当前内容实体version；本轮没有找到后台用户/实体版本GET入口。处罚及内容处置可提交仍依赖授权交接版本，尚不具备自动获取版本的完整操作闭环。建议后端/契约协调方后续提供最小授权版本投影或只读接口；需按影响另发契约记录，不修改固定输入。本端不直接查库、猜版本或扩展身份读取。

新增传输及组件测试源码描述下列验收，均未运行：三角色/空角色/未登录路由；脱敏列表与按需详情；空正文、目标不匹配、字段过滤；独立账号/案件/正文/实体版本；固定等级与理由、确认、幂等重试、409重读；申诉解罚不复活旧业务提示；401/403清理、撤权及迟到回执。测试替身仅在*.spec.ts内，不打入运行时应用，不模拟服务端事务作为真实验收。

实际只执行`pnpm format`成功。按用户要求未运行`pnpm check`、`pnpm build`、`python3 scripts/check_documents.py`、`git diff --check`及实际HTTP/浏览器/三端联调；不沿用前序178/58的旧结果。正式举报类型/运营资料、真实审计原子性、学校/内容安全供应商和后续三端验收仍由对应交付方及用户完成。状态为源码交付、未验证，不关闭共享阻塞或签发审批。

源码和后端只读输入指纹、实际命令与未执行范围见[源码追踪清单](../validation/2026-10-23-safety-management-source-r1.json)。本文件随docs提交固定，后续勘误或精确推送结果另建补充，不改旧记录。
