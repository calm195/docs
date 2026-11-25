# 客户端体验改进增量 v1

适用于小程序本人学生认证、悄悄话本人读取及管理端分页。设计和交互见[本轮方案与原型](../design/client-improvements-2026-11-25/README.md)。

## 学生认证草稿

| 请求 | 成功响应 |
| --- | --- |
| `GET /api/v1/me/verification-draft` | `data.active` 是当前通过照片，`data.candidate` 是正在替换或扫描失败的照片。各字段可为 `null`，非空时包含 `asset_id`、`scan_status`，以及可选的 `scanned_at`。 |
| `GET /api/v1/me/student-card-assets/{id}/preview` | 当前可用照片的 `image/png`，禁止缓存，跨账号及已不适用照片返回 404。 |
| `DELETE /api/v1/me/student-card-assets/{id}/draft` | 移除这一个当前或候选照片，返回 `data.removed=true`。并发时只处理路径指定的照片，已不在草稿的对象返回 404。 |

本人会话鉴权沿用学生卡接口。图片以迁移 `0034` 的资产槽位关联账号，扫描成功才替换当前照片。人工待审或已通过时草稿为空。图片与申请提交分别校验，审核读取仍绑定提交时资产。被替换或移除的对象退出草稿预览和提交范围。

## 悄悄话

本人列表、本人详情的当前公开版本可读原始 `title`、`body`、`identity_input`。其他账号及进入隐私保护、隔离或限制屏障的版本保持原有读取约束。公开列表和详情继续使用经过审核和可见性复核的内容。半匿名选择沿用现有 `identity_input`；发布者可逐项选择校区、性别、年级，已保存选择在编辑时回显。

## 管理端

在本轮支持的游标列表中，调用方可用一基 `page` 和现行 `limit` 请求确定页。`page` 与 `cursor` 互斥。响应在原有 `items`、`next_cursor` 旁增加 `page`、`page_size`、`total`，且 `next_cursor` 为 `null`。空集合返回第 1 页及 `total=0`。过期页码按当前筛选范围返回末页。未提供 `page` 时沿用游标响应。

范围覆盖资料、资料分类、平台用户、后台账号、身份审核与历史、内容管理与审核、常规与树洞危机、树洞审核与举报、举报与申诉。普通举报支持 `status=resolved`，处罚管理先过滤再计算条数。心愿和悄悄话管理详情在 `include=stats` 且存在公开正文时返回零基 `comments_page` 和实际公开评论及回复行数 `comments_total`，每页 30 行。
