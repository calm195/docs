# 用户直接处置契约 user-restrictions/1.0.0

2026-10-29；依据[需求v1.2](../../requirements/admin-users-v1.2.md)与[设计](../../design/admin-user-restrictions-v1.md)。新模块独立发布，不改既有固定查询契约。

[OpenAPI](openapi.json)为Wire输入；[样例](examples.json)用于隔离开发；[指纹](manifest.json)用于两端交付核对。所有请求要求后台Bearer，直接状态与写操作均仅super_admin；每次请求重新授权。请求ID遵循既有标准，响应Cache-Control:no-store；GET不接受查询参数。

GET `/api/v1/admin/users/{id}/restrictions` 返回账号版本、并存限制及可选动作。POST `/api/v1/admin/users/{id}/restrictions/{action}` 的action为ban/unban/mute/unmute，实际注册四条固定路由。请求仅reason/expected_version，要求Idempotency-Key；reason去首尾空白后非空，UTF-8不超过2000字节。expected_version为GET的Account.version。

封禁至解除；禁言168小时。unban撤销当前全部有效ban，unmute撤销当前全部有效mute，分别保留另一类型。危机/内容/隐私屏障均不改变。状态已不支持动作、版本或幂等内容冲突均409；重读并重新确认，不自动重提。超管重试同键同内容返回当前可授权状态，不保证历史快照；注销屏障后404。

成功HTTP200，code=0；错误400/401/403/404/409/429/500/503沿既有非零code、message、error_code、request_id封装。前端根据HTTP处理，不能将失败视为空页或已成功。契约静态校验不证明运行通过；实际范围见端内交付记录。
