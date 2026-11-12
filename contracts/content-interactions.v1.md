# 内容互动增量协议 v1

本增量依据[实施设计](../design/content-interactions-v1.md)，继承现有全站、心愿、悄悄话及资料契约。路径前缀为 `/api/v1`；沿用标准响应信封、会话、当前权限复核及写命令幂等键，不改写冻结输入。本轮字段以本文件和配套三端实现核对，实际验证边界记录在三端现状。

## 心愿发布与展示

取消同作者三条活跃心愿限制，包括上架与已实现回退；认证、频率限制及唯一匹配仍由现有规则约束。`duration_days` 接受1–90整数，省略默认7；存量截止时间不批量更新。提交审核显式传 `publish_intent:true` 表达发布意愿，当前版本审核通过自动上架；旧客户端省略该字段继续原待上架流程；撤回或旧版本任务不能重新上架。

心愿内容增加有序 `image_ids`（最多3张）及 `identity_mode`。新身份模式和图片公开读取必须通过当前内容版本、父帖与账号权限；图片不能直接传任意外部URL。公开署名与半匿名的展示字段、主页、故事和分享一致；半匿名不返回真实作者映射。首次公开后身份模式不可改变。

审核详情及后台公开内容的图片使用 `images: [{id,url,position,scan_state}]`；位置从0开始。相对 `/api/v1/` 图片地址需携带当前会话授权读取；客户端切换案件、账号或撤权后清除图片预览，不将私有对象引用持久化。

## 评论、作者补充与楼内回复

心愿评论使用以下增量接口：

| 方法 | 路径 | 语义 |
| --- | --- | --- |
| GET / POST | `/wishes/:id/comments` | 读取根评论/指定楼内回复，或创建并提交审核（202） |
| GET | `/me/wish-comments`、`/me/wish-comments/:id` | 本人待审/公开/撤回状态及可读原稿 |
| PUT | `/me/wish-comments/:id` | 按评论版本改稿并重审（202） |
| POST | `/me/wish-comments/:id/withdraw` | 按 `expected_version` 撤回 |
| PUT | `/me/wishes/:id/comments-setting` | `{expected_version,comments_open}` 设置评论开关 |

创建必填 `body,expected_post_version,expected_comments_epoch`；可选 `kind` 为 `comment`（默认）或 `author_supplement`，更新另须 `expected_version`。楼内回复同时提交 `root_comment_id,reply_to_comment_id`，只能引用同心愿同根的当前可见评论。作者补充只能由帖主创建，单独区域展示；本人改稿/撤回不会因客户端关闭提示而丢失原版本和幂等键。

列表可按 `kind=author_supplement` 读取补充，或按 `root_comment_id` 分页读取该楼回复；根评论默认列表不重复返回补充。响应为 `items,next_cursor`。悄悄话现有评论写入及列表增加同名root/reply字段，并沿用原父帖/代次/身份和审核规则。根评论撤回可返回无原文身份的“该评论已删除”占位；治理、隐私屏障优先于占位。

## 收藏与浏览

| 方法 | 路径 | 输入或返回 |
| --- | --- | --- |
| PUT / DELETE | `/me/favorites/:kind/:id` | 设置/取消收藏，返回 `{kind,target_id,favorited}` |
| GET | `/me/favorites` | 可选 `kind,cursor,limit`；返回本人 `items,next_cursor` |
| POST | `/content/:kind/:id/views` | `{event_id}`，页面实例的UUID；返回当前统计 |
| GET | `/me/notifications/summary` | 返回当前会话可见通知的 `unread_count` |

收藏及浏览目标种类为 `wish`、`whisper_post`、`resource`。收藏是私有引用；失效项仅保留最小引用与取消入口，不返回旧正文。资料摘要和浏览始终遵守认证读取资格。浏览为成功进入详情次数，同一页面事件重复上报不累加；新客户端不同时调用旧心愿 `view=1`。未读汇总与通知列表使用相同过滤，不能由当前分页推算。

## 自定义词库规则

原 `entries` 字符串列表继续有效。草稿输入、详情及历史恢复新增可选 `rules`，每条为：

```json
{
  "entry": "示例词条",
  "category": "abbreviation",
  "aliases": ["slct"],
  "match_mode": "word",
  "action": "hint"
}
```

规则必须引用完整entries快照中不重复的词条。`category` 支持 `internet_slang`（网络用语）、`insult`（攻击辱骂）、`negative_expression`（消极表达）、`abbreviation`（缩写变体）；`match_mode` 为 `contains` 或 `word`；`action` 为 `hint` 或 `review`。未配置词条保持原处置。只有 `ordinary_violation` 支持 `hint`，危机及涉校词库配置 `hint` 拒绝，保持原有审核路由。运营分类不改变涉校及危机路由；提示不等于自动拒绝。草稿试跑与正式扫描使用同一规则，发布不自动重扫历史。
