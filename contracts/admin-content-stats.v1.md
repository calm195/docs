# 管理端公开内容统计增量 v1

继承[内容发现与管理](content-discovery.v0.2.1-r1.md)及[互动增量](content-interactions.v1.md)。本增量只补公开内容工作区的统计投影，不改变审核案件、匿名归属、危机证据或导出授权。

管理心愿及悄悄话的列表和详情GET可显式带 `include=stats`：

- `/api/v1/admin/content/wishes`、`/api/v1/admin/content/wishes/:id`
- `/api/v1/admin/content/whispers`、`/api/v1/admin/content/whispers/:id`

可与原筛选、列表分页或详情 `comments_page` 合用。不带该参数时保持旧响应形状；带参数时在各内容投影增加可选 `stats`。

| 内容类型 | `stats` 字段 |
| --- | --- |
| 心愿 | `application_count`、`support_count`、`comment_count`、`view_count` |
| 悄悄话 | `hug_count`、`comment_count`、`view_count` |

所有数值为真实业务聚合，口径沿用对应公开内容接口。可见根评论及楼内回复计入评论数，作者补充不算一条普通评论；待审/驳回或已撤回记录不得当作公开互动。若内容无法提供公开统计投影，省略 `stats`，界面展示不可用状态而不是填0。明确返回的0才表示该项为零。

仍由服务端复核普通内容管理岗位。仅有危机岗位的账号不能读取此工作区；匿名帖子不会因此增加作者反查字段。审核理由、版本冲突及原键重试继续使用各领域现有端点。导出按钮必须服从原 `exportable`，有统计不代表可以导出。

实现与测试边界见[样板接口与环境](../design/client-sample-api-v1.md)和三端滚动文档。
