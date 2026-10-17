# T002 语义约束与补全依据 v0.1.0

关联REQ-001–008、014–021；REQ-009–013仅排除检查。

| 项目 | 实施约定与依据 |
| --- | --- |
| HTTP | 成功JSON固定`code=0,message,data,request_id`；204空体；错误按error_code分支，code仅非零技术码；API设计§1/7。202仅持久受理，不代表审核、送达、公开或删除完成 |
| 鉴权 | 学生和后台独立不透明Bearer会话；DB查生命周期、auth_epoch、撤销/到期及当前限制。游客公开端点若携带有效身份可切本人/参与者投影，但不能由客户端参数切权限；api§1/2/6、security§2/3 |
| 幂等 | 所有领域写（含DELETE、multipart）传Idempotency-Key；同身份+方法+规范资源路径+键绑定规范请求摘要；同键异内容409 IDEMPOTENCY_CONFLICT。成功回执仅对象引用，重试重新授权，不重放已删正文；微信code采用同code去重，无有效回执重新取code；api§1。后台登录在D02确定凭据交换后定义去重，不伪造学生登录 |
| 版本 | 更新传目标expected_version；明确跨聚合另传wish_expected_version；消息用expected_write_epoch，不混用。审核请求绑定精确案件版本，服务端从任务取content_version和hold_epoch再次核验；不允许前端任意选旧正文。创建无现存对象不要求版本；api§1及decisions末尾 |
| 枚举技术映射 | 求助/help、组队/team、物品/items、脱单/dating、技能交换/skill_exchange、其他/other；五山/wushan、大学城/university_town、国际校区/international、不限/any。报答milk_tea/meal/reciprocal_gift/skill_exchange/sincere_thanks分别对应基线五项，默认最后一项；仅稳定传输命名，不新增选项。账号verification用database§3的verified；审核decision仍approved |
| 分页 | 普通默认20最大50；聊天默认50最大50，按api§1建议冻结为技术默认。普通时间+随机UUID倒序；游标签名绑定账号、路由、筛选、目标；空/稀疏页合法，不用缓存补失效内容。public-profile使用公开时间+ID混合wish/story流，item带kind；其排序/封装为不改语义的技术补全 |
| 消息 | after_seq与cursor互斥，均未传从0；items仅当前可读delivered，按delivery_seq升序，next_after_seq=末条实返序号，空页不推进。202没有序号；B先达=1、A慢审后达=2；回滚不占号、重试同号。消息状态接口pending汇总扫描/人工待审；api§9.1、ADR-013 |
| 上架与回退 | published才公开；满额上架200 ready，过期200 expired；B01已实现回退满3条返回409 ACTIVE_WISH_LIMIT并保留原状态。普通回退与例外退出不得混同；api§3、baseline§5/10 |
| 审核与提示 | 驳回reason与revision_suggestion均非空；本人状态接口返回review_result，故事story_review_result。新版本检测pending，不能沿用旧批准。公开版本school_related=true时notice_codes含UNVERIFIED_SCHOOL，notice_text=未经证实；false为空数组/空字符串；全部公开入口一致。管理结果content_decision与business_outcome分开；api§9.3 |
| 警告 | 首次display服务端+30秒；remaining_seconds向上取整非负，未display为30。29秒ack为409 WARNING_WAIT_REQUIRED；满30秒可成功。重进不重置，提前409不锁死同键；不是禁言，不暂停无关关系；api§9.2 |
| 注销 | 专用高熵回执无身份/正文；202撤销会话且公开屏障即时生效，清理未完processing。四公开入口都查privacy_hold，不因存活作者或删除匹配解除；仅匹配新版本与hold_epoch审核放行。作者本人也不回显屏障旧正文；api§9.3/security§7/10 |
| 安全响应 | 无权公开对象404，角色无权403，会话失效401，依赖不可用503；敏感响应Cache-Control:no-store，不把姓名/学号/学生卡塞进普通Me或列表。不提供任意私聊搜索；api§1/6/security§3/6 |
| 技术补全 | ID对客户端不透明，后端数据库随机UUID；UTC RFC3339时间。Idempotency-Key暂定1–128字符，防止无限header；同键异摘要增加稳定IDEMPOTENCY_CONFLICT，异常恢复增加INTERNAL_ERROR。创建资源201、异步受理202、同步更新200、删除/注销当前会话204，原设计明确的状态优先。均为传输细节，无新增业务门槛 |

尚待交付而不自行补规则：D02后台登录/账号绑定字段、D03举报类型/词库/热线，消息/故事产品字数上限（基线未定义）、身份标签grade/gender取值及安全部署参数。OpenAPI字符串并不授权任意业务枚举，T008/T011/T014实现前按已批准输入和交付资料收敛；若涉及业务歧义，停止受影响部分并请负责人确认。学生卡候选JPEG/PNG及5MiB不能在契约中伪称已确认上线参数。

REQ-009–013延期：无悄悄鲤/语音、暖评/抱抱、胶囊/树洞发布、独立搭子、积分消费端点；心愿team分类及REQ-017危机关怀继续保留。无WebSocket、业务图片/消息撤回/OCR/公众号集成。
