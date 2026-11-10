# 心愿支持与后台热点 v1

本增量适用于公开心愿与后台首页。现有公开热点入口 `GET /api/v1/content/hot?kind=wish|whisper` 继续采用原有可见性和最多 10 条的限制，心愿条目新增支持数和本人状态字段，心愿周榜中的本人状态为 `false`。

## 心愿支持

- `PUT /api/v1/wishes/:id/support` 设置为已支持，`DELETE /api/v1/wishes/:id/support` 设置为未支持。请求无需正文，要求当前有效的学生会话，允许作者支持自己的公开心愿。
- 成功响应为 HTTP 200，业务数据为 `{ "support_count": 1, "supported": true }`。相同目标状态可以安全重试。已支持时重试保留原始支持时间，取消后重新支持记录新的时间。
- 游客操作返回 401。未公开、已过期或存在可见性屏障的心愿不能操作。
- `GET /api/v1/wishes` 条目包含 `support_count` 和 `supported`。有效学生会话读取本人状态，游客状态为 `false`。公开心愿详情在 `data.support` 返回相同字段，作者本人详情也可读取。
- `GET /api/v1/wishes?sort=support` 按当前有效支持数、上架时间、ID 依次降序，继续使用原有游标和筛选参数。有效支持为仍保留且支持账号当前有效的记录。
- 心愿周榜保留近期有效应愿与详情打开分，再按最近七天新增且仍有效的支持每条加 1 分。累计热度排序沿用既有规则。

## 后台热点

`GET /api/v1/admin/content/hot?kind=wish|whisper` 复用后台首页的有效会话校验。每类返回 `data.items`，按对应公开周榜顺序最多返回 10 条。条目包含 `id`、`title`、`body` 和 `heat_score`，心愿额外返回 `support_count`。悄悄话沿用当前周榜计分与可见范围，后台响应省略作者身份。
