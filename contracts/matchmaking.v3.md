# 包分配活动协议 v3

本页描述相对 [v2](matchmaking.v2.md) 的账号资料变更。接口沿用 `/api/v1`、学生会话、统一响应与写命令幂等键。

## 通用资料

- `GET /me` 和 `PUT /me/profile` 的本人资料包括昵称 `nickname`、校区、性别、年级（后三项沿用 `identity_tags`）与 `mbti`。保存沿用账号的 `expected_version`。MBTI 允许 16 种标准四字母代码，空字符串清除，旧客户端省略时保留当前值。
- 公开展示设置仍控制校区、性别和年级。MBTI 由本人维护，只在本人资料和已获授权的活动资料中使用。学生认证信息独立管理。

## 包分配专用资料和报名

- `PUT /matchmaking/profile` 的 `profile` 仅接受年龄、身高、体重、对应的配对区间、微信号和自我介绍。继续使用专用资料的 `expected_version`，支持部分保存。
- `GET /matchmaking/profile` 返回 `{version, account_version, ready, profile?}`。服务端读取同一账号当前的通用资料与专用资料，返回报名预览。预览和报名快照沿用 `name` 键，新增报名时其值来自账号昵称。学历从报名预览和快照的返回字段中移除。
- `PUT /matchmaking/activities/:id/enrollment` 接受 `{expected_version, profile_version, account_version, consent: true}`。提交在账号锁下核对两个资料版本，避免确认后使用了不同资料。任一版本不符返回 409，客户端须重新读取并重新确认。
- 存量报名快照保持原始值。存量活动专用资料的年龄、身高、体重、配对区间、微信号和自我介绍继续可用。旧报名专用资料中保存的昵称、校区、性别、年级和 MBTI 不再用于新报名。账号 MBTI 默认未设置，可由本人确认后填写。
- 部署先应用后端数据库迁移 `0023`。已启用包分配的旧小程序客户端使用 v2 报名请求，需随此后端变更更新客户端。其他活动、任务与聊天规则沿用 v2。
