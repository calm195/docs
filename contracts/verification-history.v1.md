# 身份审核工作区只读历史增量

日期：2026-11-16。继承[人工认证协议](verification.v0.2.0.md)及[体验版身份查询增量](trial-improvements.v0.2.1-r2.md)，为[原型 v2](../design/prototypes-v2/README.md)补充首次申请时间和已处理案件的只读结果。保留原学生申请/重提、待审材料、图片访问和决定接口，不新增审核状态或数据库结构。实现和实际验证见[后端现状](../development/backend/README.md)、[管理端现状](../development/admin/README.md)。

## 授权与响应

统一前缀 `/api/v1`，使用后台 Bearer 会话。仅当前有效的 `review_operator` 或 `super_admin` 可访问；仅有 `crisis_operator` 时拒绝。每次请求重新核对会话、岗位及被访问主体生命周期，读取通过并完成访问留迹后才返回。所有响应 `Cache-Control: no-store`，成功沿用 `code/message/data/request_id` 封装。

本增量不返回学生账号ID、学生卡引用、存储对象地址或图片。审核人只提供后台审核账号编号，不附登录名、权限或其他个人资料。

## 列表首次申请时间

`GET /admin/identity-reviews?view=pending&include=created_at` 或 `view=history&include=created_at` 在既有工作区列表的每项增加 `created_at`，格式为RFC3339时间字符串。`created_at`表示该申请记录的首次创建时间；驳回后重提复用同一申请记录，不代表最近重提时间，界面标为“首次申请时间”。

显式 `include=created_at` 必须与 `view=pending` 或 `view=history` 一起使用；空include、其他include值、重复参数、未知参数或缺少有效view返回400。列表允许的参数仅为 `view/include/cursor/limit`。未提供include时，既有列表响应逐字段保持不变，避免破坏旧客户端严格解析。分页、游标与对应队列绑定、姓名学号授权解密和访问留迹沿用既有工作区规则。

增量列表项示例：

```json
{
  "id": "6c500000-0000-4000-8000-000000000002",
  "version": 1,
  "status": "pending",
  "kind": "identity_review",
  "name": "合成学生",
  "student_number": "202600000001",
  "created_at": "2026-11-16T01:00:00Z"
}
```

## 历史详情

新增 `GET /admin/identity-reviews/{id}/history`，不接受查询参数，只返回当前状态为 `approved` 或 `rejected` 的可访问案件。使用独立响应，不改变原 `/admin/identity-reviews/{id}` 的材料详情形状。历史读取不重新获取或返回学生卡。

| 字段 | 类型 | 语义 |
| --- | --- | --- |
| `id` | UUID字符串 | 申请编号 |
| `version` | 正整数 | 当前申请版本 |
| `status` | 字符串 | `approved`或`rejected` |
| `name`、`student_number` | 字符串 | 经当前岗位授权解密的申请姓名、学号 |
| `created_at` | RFC3339字符串 | 首次申请时间 |
| `reviewed_at` | RFC3339字符串或null | 本次终态处理时间 |
| `reviewer_id` | UUID字符串或null | 后台审核账号编号；null显示未知审核员，不推导其他身份 |
| `reason`、`revision_suggestion` | 字符串或null | 当前审核原因和修改建议；缺少时明确显示未提供 |

后四个可空字段始终返回，缺少值用null，不能由客户端填造。`approved`结果的`reason`和`revision_suggestion`始终为null，不返回旧驳回意见。成功data示例：

```json
{
  "id": "6c500000-0000-4000-8000-000000000002",
  "version": 2,
  "status": "rejected",
  "name": "合成学生",
  "student_number": "202600000001",
  "created_at": "2026-11-16T01:00:00Z",
  "reviewed_at": "2026-11-16T01:10:00Z",
  "reviewer_id": "6c500000-0000-4000-8000-000000000003",
  "reason": "照片关键信息不清晰",
  "revision_suggestion": "请重新上传清晰的学生卡照片"
}
```

无会话401、岗位不足403；不存在、不可访问、主体已注销或当前仍pending的案件返回404。非法参数400；读取或审计失败时不返回部分材料。错误继续使用既有错误封装，不泄漏案件是否属于另一账号。

历史页只有查看操作；既有决定API继续保留，仅pending可审核，非pending决定仍由服务端拒绝。后台列表中的“历史”指当前已处理申请集合，不是每次驳回重提的不可变事件账本；重提后案件回到待审，旧意见不作为当前历史结果继续展示。

## 兼容与验证要求

不修改已应用迁移。`created_at`、`reviewed_at`、`reviewer_id`、`reason`和`revision_suggestion`复用已有身份申请字段。客户端必须显式选择增量列表投影，历史详情使用独立类型和严格解析。

验证覆盖：无include旧响应、显式include与非法组合、pending到终态的队列转移、只读历史无卡引用、null字段、岗位拒绝、撤权/注销后拒绝访问、审计失败关闭，以及旧版本决定与同键回执恢复。页面关闭或换号后不得回填旧历史内容。
