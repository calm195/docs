# 头像上传增量 0.2.1-r2

头像上传在[体验版资料接口](trial-experience.v0.2.1-r1.md)基础上扩展，使用当前学生会话、本人资料版本和 `Idempotency-Key`。

| 接口 | 输入和返回 |
| --- | --- |
| `POST /api/v1/me/avatar` | `multipart/form-data` 包含一个 `file` 及文本形式的 `expected_version`。成功返回更新后的本人资料。 |
| `DELETE /api/v1/me/avatar` | JSON 输入 `{expected_version}`，恢复默认头像后返回本人资料。 |
| `GET /api/v1/me` | 有 COS 头像时返回 `avatar_id` 和用于展示的有效期 5 分钟的 HTTPS `avatar_url`。 |

上传接受最大 2 MiB 的 JPG 或 PNG。后端检查文件内容，规范化为去除元数据的 PNG，完成图片审核和 COS 写入后切换账号头像。PostgreSQL 记录头像归属、COS 对象键、校验摘要、大小及生命周期。版本冲突、审核拒绝或上传失败时继续使用当前头像。客户端重试未知结果时沿用原文件、资料版本和幂等键。

头像对象存储在私有 COS 桶的独立前缀。客户端使用服务端签发的短效地址展示头像，读取失败时回退默认头像。已替换、已移除或失去归属的对象由账号 worker 清理。旧资料中的 HTTPS 头像地址继续兼容，新资料表单通过文件上传和默认头像入口管理。

显式应用 `0013_account_avatars` 后更新 API 和账号 worker。微信小程序直读 COS 时需登记对应桶的 `downloadFile` 合法域名。见[腾讯云小程序集成说明](https://cloud.tencent.com/document/product/436/122402)。
