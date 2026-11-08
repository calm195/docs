# 心愿和还愿故事分享增量

版本 0.2.1-r1。分享入口位于各自详情页。

## 原生分享和回流

好友使用微信小程序卡片。朋友圈使用微信原生菜单，读取对应详情页的公开投影。两种入口均携带 `id` 与 `shared=1`，回流使用公开读接口。

`POST /api/v1/share-links` 仍接受 `target_kind`、`id` 和原有幂等键。成功回执的 `miniapp_route` 按内容类型返回 `/pages/wish-detail/index?ref=<UUID>` 或 `/pages/stories/index?ref=<UUID>`。旧分享页已退役。

## 带码图片

`GET /api/v1/share-links/{ref}/code?env_version=develop|trial|release` 要求有效的普通学生会话。查询参数只接受单个 `env_version`。服务端重新核对引用的公开资格，再为指定版本生成对应业务页的微信小程序码。请求无效为 400，会话缺失或无效为 401，会话受限为 403，引用无效或内容不再公开为 404，微信能力不可用为 503。

成功沿用通用响应封装，`data.image_base64` 为标准 Base64 编码的 PNG。小程序将其与当前公开标题合成分享图片。小程序码 `scene` 使用去掉连字符的 32 位 UUID，业务页还原后通过 `GET /api/v1/share-links/{ref}` 读取当前公开投影。内容正文与账号标识不写入扫码参数。图片的生成与发布由微信客户端分别处理，客户端只反馈可确认的操作结果。
