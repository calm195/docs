# 包分配活动协议 v2

本页描述相对 [v1](matchmaking.v1.md) 的变更。路径以 `/api/v1` 为前缀，沿用现有学生或管理会话、统一响应、写命令幂等键和乐观版本。

## 个人资料与报名

- `GET /matchmaking/profile` 返回本人资料 `{version, ready, profile?}`。首次使用时版本为 0，`ready` 表示资料是否齐备。已报名快照继续从活动详情读取。
- `PUT /matchmaking/profile` 接受 `{expected_version, profile}`，返回技术回执。资料可以部分保存。人格字段 `mbti` 接受四字母代码或空字符串，当前由用户手动维护。选填的微信号兼容旧资料。资料保存与报名授权独立。
- `PUT /matchmaking/activities/:id/enrollment` 接受 `{expected_version, profile_version, consent: true}`。后端读取对应版本的账号资料并加密保存活动快照。版本不符时刷新资料再确认。通过审核的存量报名、配对和任务快照继续读取。
- 活动创建和编辑无需提交 `campuses`。存量活动保留历史校区数据兼容旧展示，校区不参与报名资格判定。现有推荐仍保留校区分值。

## 已结束活动统计

学生端活动列表和详情仅在 `phase=ended` 时返回 `summary`，其中 `enrollment_count` 为尚未退出的留存报名人数（含待审、通过和驳回），`successful_pair_count` 为仍处于已发布状态的配对组数。空活动两个字段均为 0。统计与页面数据同一数据库读取快照，只返回数量。后续退出、解除或隐私清理可能更新统计。

## 配对会话

有效配对发布后，活动详情的 `pair.conversation_id` 提供包分配会话入口。会话和配对在同一发布事务建立，并通过已有聊天接口收发消息。聊天列表和详情均按当前双方资格、拉黑和活动配对状态检查访问。活动正常结束后，有效配对的会话继续可用。取消活动、解除配对、退出或账号资格失效后收回由该配对授予的访问。

## 独立任务库

- `GET /admin/matchmaking/task-library` 分页读取任务库。新建用 `POST` 同路径，编辑用 `PUT /admin/matchmaking/task-library/:task`。写入接受 `{expected_version, kind, body, min_day, enabled}`。最早可分配日 `min_day` 默认 0，3 表示第 3 天起可分配。
- `PUT /admin/matchmaking/activities/:id/task-plan` 接受 `{expected_version, first_task_id}`。首日任务必须启用且当天可分配。后台工作台 `task_plan` 返回选定任务和首个无法排满的日期，0 表示可排满。
- 首次发布结果时冻结该活动任务池，生成每组的任务快照。固定首日之外，按各日允许范围无放回抽取。旧活动可沿用 v1 专用模板。读取和解锁规则沿用 v1。
