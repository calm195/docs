# 黑名单读取与动作归属契约

正式增量版本为OpenAPI 0.2.1、静态动作索引revision 6，关联T026/T027、REQ-014、REQ-018。该版本收录后端已有黑名单读取及条目版本，纠正解除动作提示和静态索引归属；业务拉黑、解除、处罚、申请和私聊规则沿用批准基线。旧0.2.0/revision 5及其工具和指纹保持不变。

## 接口与版本

| 操作 | 输入与结果 |
| --- | --- |
| `getMeBlocks` · GET `/api/v1/me/blocks` | 本人有效学生会话。`limit`默认20、范围1–50；`cursor`省略读首页。200返回`items[].target_user_id`、`items[].version`、`next_cursor`。空列表为`[]`，终页游标为`null`。不返回目标昵称、身份或正文。 |
| `postMeBlocks` · POST `/api/v1/me/blocks` | 沿用`target_user_id`和幂等键，200返回`target_user_id/blocked=true`。重复拉黑不建立重复记录。新增记录取得新版本，不能用历史DELETE清除。 |
| `deleteMeBlocksTarget_Id` · DELETE `/api/v1/me/blocks/{target_id}` | 幂等键和`expected_version`必填；版本取当前本人列表中对应条目的`version`，不能使用Me.version。成功204；条目不存在或不归本人404，旧条目版本409 `VERSION_CONFLICT`。 |

GET和DELETE均按当前会话及普通账号权限复核：会话过期/撤销401，当前禁言或封禁403。GET不需要幂等键；参数未知、重复、为空、格式错误或limit越界400。列表按`created_at DESC,target_id DESC`，签名游标绑定读取账号和用途；篡改、跨账号、跨用途或格式无效400。当前格式没有时间到期承诺；删除导致位置消失时仍可从原位置向后读取，空页合法。服务端不记录客户端翻页历史；客户端遇到重复/循环游标停止翻页并显式刷新，不把异常游标当成功结果。每次读取复核当前状态，不缓存恢复已失效记录。

## 动作归属与兼容

正式解除动作属于`Me.allowed_actions`：仅在安全模块显式装配且当前普通资料动作可用时提示`deleteMeBlocksTarget_Id`。Me绑定当前账号；具体目标及版本来自该账号当前读取的`BlockEntry`。动作提示不替代后端逐次授权、记录归属和版本检查。GET是读取操作，静态索引`projection=null`，不因静态目录存在就赋予写权限。

新后端仅发送正式动作名，静态索引不接纳旧别名`deleteMeBlocks`。已只读核对当前小程序能够消费正式名，保留其旧后端兼容不需要改前端；其他消费者须在切换前核对自己的动作白名单。URL、DELETE请求体和版本字段不变，无数据库迁移或环境变量变更。

双向拉黑使存量待审或有效未匹配申请失效，限制新申请/私聊；解除不恢复旧申请或消息。重复成功请求只按原幂等命令语义重放；后续新建记录使用新版本，旧版本不得解除。具体本人资格、处罚及当前关系仍由服务端检查。

## 文件与验证

新正式输入为[OpenAPI](openapi.v0.2.1.json)、[合成样例](examples.v0.2.1.json)、[静态动作索引](actions.v0.2.1.json)、[指纹清单](actions-review.v0.2.1-r6.json)。`python3 blocks_v0_2_1.py --build`只创建不存在的新产物，存在且内容不同则拒绝覆盖；日常运行`python3 blocks_v0_2_1.py`只读校验，依赖既有规范的`openapi-spec-validator==0.7.2`。不运行旧build.py覆盖固定输入。

静态校验覆盖完整OpenAPI及媒体示例、黑名单非空/空列表、缺失/零版本与越界字段负例、正式动作归属、条目版本来源和旧操作保留。运行验证及真实/合成边界见[后端本轮记录](../development/backend/milestones/2026-10-27-blocks-contract-r1.md)。其他操作的实现元数据继承历史revision 5，不表示其当前实现状态；本版本不激活审核扩展草案、不签发G1/G2/G3或宣称真实跨端验收。
