# 包分配活动协议 v6

继承[v5](matchmaking.v5.md)，新增个人特质、标签计分与全员自动分配。所有接口沿用 `/api/v1` 前缀、现有会话授权、统一响应和写命令幂等机制。算法设计见[自动分配 v3](../design/matchmaking-auto-pairing-v3.md)。

## 标签与评分

- 资料新增 `personal_traits`，与 `ideal_traits` 独立保存，每类最多十项；两类共享词库、规范化、审核和输入推荐。
- 省略某类字段保持原值，空数组仅清空对应类别。旧资料和旧报名缺少个人特质时按空数组处理，不猜测或从自我介绍补充。
- 选用关系及本人 `trait_selections` 每项的 `purpose` 区分 `personal`、`ideal` 用途；兼容旧响应时缺失用途按 `ideal` 处理。待审核标签不进入生效资料和报名快照，驳回删除两类选用关系；本人待审显示及旧草稿过滤保持独立。
- 输入推荐 `GET /matchmaking/traits` 新增 `purpose=personal|ideal`，默认 `ideal`，共享词库但热度按用途计算。标签管理列表与词云新增 `purpose=personal|ideal|all` 用途筛选，默认 `all`；全部热度按账号去重，同一人两种用途选用同词条只计一人。
- 新报名固化当时已通过的两类标签。后续修改个人资料和审核结果不改写既有报名快照；更新报名沿用原有版本和重审规则。
- `score_details` 保留五项基础分，并新增 `traits`、`personal_to_ideal`、`ideal_to_personal`。前者为标签分，两个数组分别表示第一人个人∩第二人理想、第一人理想∩第二人个人。
- 学生端仅在对方资料可访问时返回双向命中词；活动开始前、配对结束或资格失效时两个命中数组为空，既有分值展示保持不变。
- 标签分为两个交集大小之和乘五，每方向内去重；相同词条在两个方向均命中计十分。标签分最多一百分，无标签不影响基础分。总分可以超过一百分，不作为百分比展示。
- 新配对保存新算法版本与明细，历史已保存评分不追溯改变。推荐、人工创建配对与自动分配使用一致计分规则。

## 全员自动分配

操作需要现有包分配管理权限。单活动自动分配当前最多支持2000条报名（本轮按1000人验收）。仅处理审核通过、资格有效且未被占用的报名，保留现有全部配对；双向拉黑等禁止组合不进入候选。依次最大化配对人数、最大化总分，并在等价方案中随机决胜。

每次新任务生成独立随机种子，任务重试保留种子，种子和算法版本随任务保存；种子并非显示分数的一部分。客户端不能通过修改预览响应指定任意最终配对。

| 方法及路径（省略 `/api/v1/admin/matchmaking/activities/:activity`） | 请求 / 返回 |
| --- | --- |
| `POST /auto-pairing-jobs` | `{expected_version}` 绑定活动版本，返回 `{id}` |
| `GET /auto-pairing-jobs/latest` | 当前最新任务，无任务返回404 |
| `GET /auto-pairing-jobs/:job` | 任务状态与完整方案 |
| `POST /auto-pairing-jobs/:job/apply` | `{expected_version,activity_version}` 分别绑定任务与预览活动版本，返回 `{id}` |

任务状态为 `pending`、`running`、`ready`、`applied`、`stale`、`failed`。响应含 `id`、`activity_id`、`version`、`activity_version`、`algorithm`、`seed`（字符串）、`status`、`participant_count`、`eligible_count`、`paired_count`、`unmatched_count`、`excluded_count`、`total_score`、`created_at`、`expires_at`、`error`，以及 `pairs`、`unmatched`、`excluded`。`paired_count` 表示配对组数，其余人数计数字段按人统计；预览自创建起十五分钟内有效。

- `pairs` 每项包含 `first`、`second`（各含 `enrollment_id,name`）、`score`、`score_details`。
- `unmatched`、`excluded` 每项含 `enrollment_id,name,reason`。未匹配原因为 `no_candidate`（无合法候选）、`competition`（存在候选但名额竞争）；排除原因为 `not_approved`、`ineligible`、`occupied`。
- 同活动同时最多一个计算中任务，避免重复耗费资源。失败状态允许用户明确重新生成，网络结果未知时仍重试原幂等请求。
- 预览不占名额，重新生成不替换已有配对。确认前重新校验方案输入及资格、拉黑、占用等状态，变化或过期时拒绝应用并要求重算。
- 确认成功在一个事务内写入全部新草稿配对，重复确认不重复创建。草稿继续支持现有人工管理与发布，自动分配不会直接向学生发布结果。

## 升级与验证

显式应用 `0027_matchmaking_auto_pairing` 迁移扩展标签用途及持久任务结构，现有选用关系默认迁移为理想型，禁止修改已应用迁移或清空数据。API 和执行任务的 worker 均需更新并启动。

检查标签独立保存/审核/快照、计分和历史兼容、全局最优与同分随机、任务恢复、权限隔离、过期确认、幂等及并发占用。使用1000人合成数据完成算法和真实开发库端到端容量测量，测试数据应能精确清理且不影响已有业务。微信真机、生产部署与生产容量另行验收。
