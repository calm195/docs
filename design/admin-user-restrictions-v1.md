# 平台用户直接处置设计 v1

日期：2026-10-29；REQ-022-I/J/K/L，关联REQ-016/018/019。依据[需求v1.2](../requirements/admin-users-v1.2.md)中的本会话明确指令。设计与实现输入，不宣称独立审批或生产验收。

- 新建独立契约[user-restrictions/1.0.0](../contracts/user-restrictions-v1/README.md)，不改admin-users/1.0.0只读响应或旧allowed_actions枚举。直接操作状态与写权限独立获取，旧客户端仍可查询。
- 超管在用户详情中看到两组操作；先选择动作、填写理由，再重新读取动作状态与Account.version，二次确认后提交。客户端按钮不能替代服务端权限；非超管不请求直接操作状态。
- GET同时返回banned和muted，避免ban优先的全局restriction隐藏仍有效禁言。动作列表分别为ban/unban和mute/unmute；确认文案说明解除全部当前同类处罚、保留另一类型。
- POST沿用命令框架，绑定Account.version、幂等键与请求内容；持管理员、目标及其业务关系、处罚资源锁，锁后再次发现和授权。新建/解除均递增账号版本；原申诉撤销也递增账号版本，使直接处置预读失效。
- 新建直接处罚仍落public.penalties：source_kind=direct，content_id为空，violation_ref为新处罚自身技术引用，content_version固定1仅作存储兼容，不伪造内容版本。禁言168小时，封禁无结束时间；沿用ApplyPenaltyEffects取消旧待审互动/撤下已发布心愿，不撤销本人申诉会话。
- 新增迁移0028，为处罚追加source_kind、revoke_reason_cipher、revoked_by。原reason_cipher保留；直接解除理由以penalty_revoke_reason用途和处罚ID加密，按行记录，不输出自由理由。新增字段随原Penalty行注销清理。已有直接处置/解除审计时禁止down，避免审计丢失。
- 解封/取消禁言遍历当前有效对应类型，逐条设置revoked_at及加密理由；不修改content_restrictions、危机案件或隐私屏障，不复活旧互动。没有相应有效限制或已是同类受限状态时409，不隐式续期/重复新增。
- 直接处罚仍允许本人通过原申诉入口提交；直接来源申诉的后台列表、详情、决定限定超管，其他源沿原权限。普通用户查询仍只展示安全摘要，不新增匿名来源关联。
- 写成功后用户列表、详情、历史重新查询；404清空目标，403使工作区失效，409丢弃旧确认并重读；网络不明结果保留同键同请求重试。

上线顺序为显式迁移0028、后端新构建、管理端新构建；本次源码交付不自动重启既有服务或迁移正在使用的开发业务库。验证使用专属隔离数据库和合成账号。
