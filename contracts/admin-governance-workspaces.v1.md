# 管理端证据任务与举报处置增量 v1

日期 2026-11-28。继承[全站后台治理协议](openapi.v0.2.1.json)及[树洞增量](whispers-v1-r2/README.md)。以下接口使用 `/api/v1` 前缀及 `code/message/data/request_id` 响应封装，后台读取使用 Bearer 会话及 `Cache-Control: no-store`。

## 证据删除任务列表

`GET /admin/evidence-deletion-jobs?page=1&limit=10` 仅允许当前超级管理员访问。页码默认 1，范围 1–1000000；页大小默认 20，范围 1–50。重复、空值、游标或未知参数返回 400。每次请求在同一只读数据库快照内核对超级管理员、统计总数及读取当前页，排序按 `created_at DESC, job_id DESC`。页码超过当前页数时收敛到末页，空集合返回第一页。

`data` 包含 `items`、`page`、`page_size`、`total` 和固定为 `null` 的 `next_cursor`。列表仅包含未过期的证据删除任务，每项包含任务 `id`、`created_at`（RFC3339）、`source_module`（`legacy` 普通危机证据或 `whispers` 树洞证据）、`status`（`processing` 或 `completed`）及可选 `retryable_error`。安全错误提示限定为 `database_cleanup_unavailable`、`external_cleanup_unavailable` 或 `cleanup_unavailable`。响应字段不含被清理目标、正文、理由、用户身份或匿名回执。401 表示会话无效，403 表示岗位不足。

选中任务后，普通进度读取 `GET /admin/evidence-deletion-jobs/{id}`，树洞进度读取 `GET /admin/whispers/deletions/{id}`。两个详情仍分别复核来源及岗位。证据从有权查看的危机案件打开，选中项通过当前会话内存传递。匿名注销回执仍使用本人主动提供的完整凭据，调用 `GET /deletion-receipts/{receipt}` 时省略后台令牌。提交删除后的受理状态和清理完成状态继续区分。

## 普通举报处置前读取内容对象版本

`GET /admin/reports/{id}/content-control` 只读取已授权普通举报的目标与版本，拒绝查询参数。审核运营、危机岗位和超管沿用普通举报的授权范围及访问留迹。响应 `data` 包含 `report_id`、`report_version`、`report_status`、`target_kind`、`target_id`、`content_ref`、`content_version` 与 `version`。其中 `version` 为处置命令校验的业务对象版本，心愿和还愿故事使用所属心愿的版本，其余支持类型使用各自对象版本。案件和正文版本各自用于核对原举报及当时正文。

执行 `POST /admin/contents/{kind}/{id}/offline` 或 `POST /admin/contents/{kind}/{id}/release-restriction` 时，管理端先读取上述投影，再把 `version` 作为 `expected_version`，并成对提交 `report_id` 和 `report_version`。服务端在写命令的同一事务中校验案件、正文归属和对象版本，原幂等键及理由规则继续适用。两项关联字段均省略时兼容旧调用。目标缺失、来源不可访问或跨域时按原授权语义拒绝。版本冲突返回 409，重新读取并核对后才可提交新决定。解除普通限制继续沿用既有状态规则。
