# 随机头像和昵称增量 v1

个人资料的「随机头像和昵称」由服务端从三个已启用的池中抽取。头像独立抽取，昵称按「形容词 + 的 + 名词」拼接。配置保存在 PostgreSQL。超级管理员从「系统管理 → 随机资料」上传和替换头像、维护两类词条、切换启用状态及试抽。

## 抽取和图片

以下路径均相对于 `/api/v1`。

| 请求 | 权限与响应 |
| --- | --- |
| `POST /me/random-profile` | 本人资料编辑权限。成功返回 `avatar_id`、`image_path`、`nickname`、`can_reroll`。 |
| `POST /admin/random-profiles/draw` | 超级管理员。与小程序使用相同抽取规则及响应。 |
| `GET /random-profiles/images/{asset_id}` | 只按不可变资产标识提供已批准的头像展示图。`image_path` 是相对 API 基址的该路径。 |

抽取请求可传 `previous_avatar_id` 和 `previous_nickname`。头像池有其他候选时避开上一头像，只有一个头像时尽量生成不同昵称。只有一个可用组合时，`can_reroll=false`。抽取不写入用户资料，也不向小程序返回词库全文。

小程序打开面板加载候选，换一组时保留面板，失败保留上次预览并允许重试。使用这组资料仅更新页面草稿。保存时下载受控图片，然后走现行头像上传与资料保存；保存后的用户头像由既有账号资源机制管理。停用资源只影响后续抽取，已返回的批准图片仍可读取。

## 管理操作

以下管理请求要求超级管理员权限。配置变更携带 `Idempotency-Key`，更新携带 `expected_version`。列表返回 `avatars`、`adjectives`、`nouns`；头像项包含 `id`、`name`、`enabled`、`version`、`updated_at`、`image_path`，词条项包含 `id`、`text`、`enabled`、`version`、`updated_at`。写入成功返回对应条目。

| 请求 | 请求参数 |
| --- | --- |
| `GET /admin/random-profiles` | 无。 |
| `POST /admin/random-profiles/avatars` | multipart `name`、`file`。 |
| `PUT /admin/random-profiles/avatars/{id}` | JSON `name`、`enabled`、`expected_version`。 |
| `POST /admin/random-profiles/avatars/{id}/image` | multipart `file`、`expected_version`。 |
| `POST /admin/random-profiles/words` | JSON `kind`（`adjective` 或 `noun`）、`text`。 |
| `PUT /admin/random-profiles/words/{id}` | JSON `text`、`enabled`、`expected_version`。 |

新条目默认启用，审核通过的头像和校验通过的词条创建成功后即可参与抽取。头像仅接受通过格式、尺寸与安全扫描的 JPG/PNG，文件不超过 2 MiB；更换成功后才切换图片。词条去除首尾空白、同类去重，服务端校验成品昵称长度上限为 40 个 Unicode 码点，超长时拒绝新增。每个池至少保留一项启用配置。配置提交后，下一次请求读取最新已提交状态。

## 发布顺序

在目标库显式执行含随机资料初始项的迁移，再部署后端与管理端，最后交付小程序。正式环境需确保小程序 API 主机同时满足请求、上传及下载域名配置。
