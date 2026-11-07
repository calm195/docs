# 体验版交互增量契约 0.2.1-r1

2026-11-07，依据本次用户批准的体验版计划。继承[全站0.2.1](openapi.v0.2.1.json)，悄悄话及本人胶囊使用[体验版完整契约](whispers-v1-r2/README.md)。原版本文件保留。新增业务字段随既有对象版本、会话、幂等和权限规则处理。

## 心愿、审核和聊天

- 心愿创建和改稿可传 `title`，1至40个Unicode码点，空白拒绝。旧调用方省略或传空串时使用「未命名心愿」，新小程序要求填写。标题随正文密文版本保存、送审及撤回，公开标题只取本版本审核通过投影，屏障同时隐藏标题与正文。
- `reward_method` 增加 `custom`，此时必须携带非空白 `reward_text`，最多100个Unicode码点。预选报答不得携带非空 `reward_text`。自由报答与标题、正文共同送审，公开投影只返回已审核文本。
- 本人、参与者与公开心愿投影新增 `title`、`reward_text`。普通审核案件新增同名字段，人工审核必须能看到对应原版本输入。历史公开内容无标题时显示安全默认标题。
- 会话元数据新增 `wish_title`，取关联心愿当前可读取的已审标题。内容受限、未审或无标题时使用「未命名心愿」。会话读写权限继续独立判断。
- 心愿举报在服务端拒绝本人目标，小程序隐藏本人举报入口。

## 通知中心

`GET /api/v1/me/notifications` 混排普通通知、暖评与胶囊通知，按 `created_at DESC, id DESC` 分页。游标绑定本人和新的时间线作用域，旧游标不能用于新列表。

新增 `created_at` 为UTC时间字符串。悄悄鲤通知可包含 `target_kind`（`post` 或 `capsule`）、`target_ref` 和可选 `comment_id`。目标是否仍可访问，以打开时领域查询为准。已屏蔽通知不返回来源。已读接口沿用现有对象版本和幂等键，并复核本人归属与屏蔽状态。

## 个人资料

`GET /api/v1/me` 和 `PUT /api/v1/me/profile` 新增以下字段。

| 字段 | 约束 |
| --- | --- |
| `avatar_url` | HTTPS地址，最多2048字符，空串恢复默认头像。省略保留当前值 |
| `identity_tags` | 受控自选标签对象，可包含 `campus` 和 `gender`。省略保留当前值 |

校区值为 `wushan`、`university_town`、`international`、`any`。性别值为 `male`、`female`、`undisclosed`。自选标签与学生认证资料分别管理，既有公开内容仍使用各内容版本已审核标签。资料更新沿用 `nickname`、`hide_identity_tags`、`expected_version` 与幂等键。

本轮小程序通过HTTPS图片地址编辑头像。头像文件上传、扫描与存储入口需要后续另行实现。

## 模块使用说明

所有接口使用既有响应信封与 `Cache-Control: no-store`。写入必须传 `Idempotency-Key`。配置和发布只允许当前超管，学生读取与确认使用当前有效会话。

| 接口 | 请求与返回数据 |
| --- | --- |
| `GET /api/v1/admin/module-guide` | 返回 `version`、`published_version`、`modules`、`published_modules` |
| `PUT /api/v1/admin/module-guide` | 请求 `{expected_version, modules}`，保存完整草稿，返回后台模型 |
| `POST /api/v1/admin/module-guide/publish` | 请求 `{expected_version}`，显式发布当前草稿，返回后台模型 |
| `GET /api/v1/me/module-guide` | 返回已发布 `{version, modules, acknowledged_version}` |
| `PUT /api/v1/me/module-guide/ack` | 请求 `{version}`，确认当前发布版，返回当前学生模型 |

每项说明为 `{module, title, body}`，最多12项，模块标识不重复，标题1至40字，正文1至2000字，均为纯文本。未发布时学生得到 `version=0, modules=[]`。保存草稿不影响已发布内容。发布版本取该草稿版本，发布后后台编辑版本递增。确认按账号保存，重放只读取当前快照，不回退确认进度。版本冲突返回409，客户端重读后由用户确认。

小程序在学生认证通过后读取并展示尚未确认的说明，个人中心可重读当前版本。说明确认期间发布新版或重放返回新版时，客户端继续展示尚未确认的当前版本。

## 数据与交付顺序

先显式应用 `0011_trial_content`、`0012_module_guide`，再更新API和普通内容、悄悄鲤worker，随后更新管理端与小程序。增量迁移保留已有开发数据。普通服务启动继续不执行DDL。最终授权、生产迁移及真机验收由实际交付安排执行。
