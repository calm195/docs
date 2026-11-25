# 包分配公开活动协议 v9

继承[协议 v8](matchmaking.v8.md)。游客可查看已发布活动的说明、日程和阶段。运营发布的活动标题和说明面向公开浏览。

| 路径 | 请求 | `data` |
| --- | --- | --- |
| `GET /api/v1/matchmaking/public/activities` | 可选 `page`、`limit`，沿用活动列表分页规则 | `{items, total}`，按报名开始时间降序、活动 ID 升序 |
| `GET /api/v1/matchmaking/public/activities/{id}` | 活动 ID | 与列表单条相同的活动对象 |

两个接口均允许无会话调用，响应 `Cache-Control: no-store`。返回 `id`、`version`、`title`、`description`、`registration_opens_at`、`registration_closes_at`、`results_at`、`starts_at`、`ends_at`、`days`、`status` 和 `phase`。`phase` 由服务端按日程计算，`results_at` 为计划时间。活动须处于已发布状态且有发布时间。已结束的已发布活动仍可浏览，草稿、取消及不存在的活动均不出现在列表中，合法 ID 直达返回 404。

活动聚合统计、本人报名、报名联系方式、配对结果、会话和任务均走原有受保护接口。客户端在用户主动报名时复核登录和资格，沿用原报名确认与写入流程。无需数据库迁移。
