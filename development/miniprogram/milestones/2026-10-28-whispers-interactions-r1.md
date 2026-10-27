# 悄悄鲤第三批：暖评新建与编辑、抱抱和模块通知 r1

日期：2026-10-28（Asia/Shanghai）。状态：计划 C 批本端实现与规定检查完成；真实 H2 联调、微信环境验证未执行，不构成首期整体验收或上线批准。

## 1. 依据、基点与提交

【事实】用户明确授权继续第三批开发、同步文档、运行规定检查，并按模块依赖顺序提交。本次依据[小程序开发计划](2026-10-27-whispers-development-plan-r1.md)、[第二批记录](2026-10-28-whispers-text-r1.md)、[需求增量](../../../requirements/whispers-v1.md)、[授权](../../../approvals/2026-10-27-whispers-scope.md)、[接口语义](../../../design/whispers-v1/api.md)、[状态机](../../../design/whispers-v1/domain.md)和[联合验收](../../../design/whispers-v1/delivery.md)。覆盖 WM-04 与 WM-06 剩余模块通知，引用 REQ-010、REQ-014、REQ-018，复用 REQ-009 的三档身份与 REQ-011 的本人胶囊读取。

修改前核对源码 develop / `84aa0a6f9167226fafd38df55a371b6980abb7e0` 与 docs mini-deveop / `c578b4a56ddd3bf30be7dfb4645a05b1a09fb4e0` 均干净；docs使用既有 `/private/tmp/liyuanci-docs-mini-deveop` 工作树，未切换他人工作区。docs基点为上述 c578b4a 完整提交。

| 依赖顺序／模块 | develop 完整提交 |
| --- | --- |
| 暖评新建／改稿、本人入口、抱抱与对应回归／测试支撑 | `dc6a7d74c17b246278469867df7413e387aaf0bb` |
| 模块通知、已读命令、目标重验与对应回归 | `457073a4d7be20eecb48fa698cfb4f069c1c2d28` |

源码先提交，随后记录精确版本并提交docs；未推送、合并、部署或上线。质量结论针对两个相接提交的最终完整源码，不把中间提交另行宣称为独立联调通过。

固定消费 `whispers/1.0.0`，未改写生成文件或共享契约。只读复核OpenAPI SHA-256 `f4cc52d540dcc761a3d63a1ea47f8e371f3bd2ea87bb9caddf812153ee1101a0`、actions `d28f5a8088e321081d2280ca5e8a80b44ea215ffb1e8f605b181d6a3f50d708b`、examples `cf29bcf6072e2d9fa07904f48b84a33c5f806bbb63ec4345e9a71d923d274683` 与原值一致；详见[验证元数据](../validation/2026-10-28-whispers-interactions-r1.json)。

## 2. 实现与可测试验收

| 文件／模块 | 已实现行为与验收映射 |
| --- | --- |
| `src/pages/whispers/comment-editor.vue` | 独立新建／编辑暖评，直接送审，没有服务端暖评草稿；普通未认证账号可按PublicPost动作提交，不依赖发帖认证或Workspace。先读本人OwnerComment，再从其post_id读取当前父帖，不信任路由替代父帖。正文500码点、不trim、拒绝空白／孤立代理项；三档身份复用当前字典与active昵称。新建携父帖version／comments_epoch，修改另携本人评论version，不能用content_version代替；202明确仅受理。REQ-010／W010-A、WI-03 |
| 同上 | 父正文变更提示重新阅读并显式改稿重提；关闭评论禁止新提交，恢复后不自动补发；post_id=null不访问路由父帖、不复制recovery_body为草稿、不修改旧记录；安全候选仅供本人另选帖子重新填写新评论。沿用页面scope，离页／换会话／切账号清正文与未知结果重试；冲突清未提交输入并重读，不自动覆盖。REQ-010、REQ-018／W010-B、W018-A、WI-04、13、17 |
| `src/pages/whispers/mine.vue` | 本人评论动作提供编辑入口，编辑页重读本人记录及父帖；安全候选增加广场入口，另选当前公开帖填写新评论，旧串不会自动恢复。撤回沿用第二批已实现能力。REQ-010、REQ-018 |
| `src/pages/whispers/detail.vue` | 新增写暖评入口及抱抱／取消按钮。抱抱PUT目标态active与当前父帖version、my_hug.version，非作者且具动作才能请求；采用返回hug_count与my_hug，不做本地加减；连点互斥、结果未知原键原体重试、409重读后手动确认。公开暖评屏蔽只传当前comment来源及content_version，成功清旧串，无账号映射。REQ-010、REQ-014／W010-C、W014-A、WI-05、07 |
| `src/pages/whispers/notifications.vue` | 独立模块通知列表与分页、已加载未读数、刷新与显式已读。expected_version来自当前Notification，UUID幂等键；回执校验通知与目标引用，冲突刷新、不自动重放；未知结果只原请求重试，不提前变已读。REQ-010／W010-D、WI-06 |
| 同上 | 点击暖评通知先重读公开父帖，再按不透明游标定位指定暖评并核对父正文版本，成功才导航固定详情路由；缺失／404／401／错配均停跳且清旧读取。通知只展示通用进展，不使用notice作旧正文补偿。胶囊通知只调用当前本人详情，locked无正文，unlocked仅展示本次服务端准许返回的正文，刷新重新读取，不靠时间或通知类型解锁。标已读或分页更新后仍按当前通知引用刷新。REQ-010、REQ-011、REQ-018／WI-06、11、17 |
| `src/pages/inbox/index.vue`、`src/pages/whispers/index.vue`、`src/pages.json` | 原消息页与树洞广场提供独立模块通知入口，原聊天／全站通知消费保持独立；注册暖评与模块通知两个页面，不扩大旧通知kind枚举、不调用陌生人私聊。REQ-010、REQ-020 |
| `tests/support/whisper-pages-runtime.ts`、`tests/whisper-pages.test.ts` | 提取既有页面测试初始化为共享支撑，增加互动／通知合成响应；保留原15项页面测试与全部原有用例，避免重复复制生产适配器。只替换平台、会话边界与传输，执行实际页面、store、scope和契约校验 |
| `tests/whisper-interactions.test.ts`、`tests/whisper-notifications.test.ts` | 新增9项互动与8项通知回归；覆盖版本来源、500码点、资格与隐私屏障、状态冲突、关系错误通用文案、429、未知结果重试、连点、游标、失效目标、字段泄漏、同账号换会话／切账号及晚到响应 |

## 3. 实际检查与修复

| 命令／检查 | 实际结果与证据 |
| --- | --- |
| `npm run check` | 退出码0，ESLint、Prettier、vue-tsc与177项测试全部通过（原160项＋新增17项）；[完整日志](../validation/2026-10-28-whispers-interactions-r1-check.txt) |
| `npm run build:mp-weixin` | 退出码0，Build complete；仍提示未配置AppID、uni统计不可用；[构建日志](../validation/2026-10-28-whispers-interactions-r1-build.txt) |
| 两次源码暂存范围 `git diff --cached --check`、最终 `git diff --check` | 均退出码0；交付文件指纹见元数据，暂存范围按模块划分，没有夹带无关工作 |
| docs文档／链接／固定清单、空白检查 | 运行 `python3 scripts/check_documents.py --base c578b4a56ddd3bf30be7dfb4645a05b1a09fb4e0`，以及差异和新增文件空白检查；[文档检查证据](../validation/2026-10-28-whispers-interactions-r1-docs.txt)；只追加本次固定条目，未重写既有记录 |

【事实】初轮检查发现格式及胶囊合成对象body类型赋值问题，已修复；格式失败后运行npm run format并重新完整check。另补充“通知标已读后刷新胶囊”的回归并修复旧通知引用失效问题，最终重新完整检查通过；最后产品改动后的微信构建通过。没有降低检查规则、忽略源码或删除原有测试绕过门槛。

## 4. 取舍、边界与后续依赖

【取舍】通知通过单独页面承接，保持旧通知接口与类型不变；公开暖评回流先重验指定评论，再进入会主动重读的详情页。胶囊通知在本页提供已有对象的当前状态／正文读取，不新增完整封存管理流程，也不创建尚不存在的详情路由。第四批继续实现胶囊列表、新建、安全告知确认、预约与取消／删除等完整能力。

【事实】所有产品操作经既有callWhisper与统一request，成功码0；不新增生产默认Mock、浏览器DOM、令牌持久化、正文storage、作者主页或账号映射。结果未知请求仅本页内存原键原体；受理不等于公开，已读不改变目标可见性。无新依赖、环境变量或编译版本升级。

【真实边界】测试为正式契约样例派生合成数据和替代传输，仅证明客户端消费与状态控制。未执行真实HTTP、后端审核事务／通知首次公开去重、数据库并发抱抱／计数、审核供应商、opaque-v1部署迁移、微信开发者工具／真机、双主题视觉、弱网实机、性能、清理或备份恢复验证；不将这些项目记为通过。

【依赖】真实H2须后端提供精确HTTP提交、隔离身份、父帖开关／换版与审核并发、首次最终公开单次通知／改稿不重发／自评论不通知、抱抱唯一行为记录及旧版本拒绝、隐私／注销即时屏障证据；还需要正式字典、审核和微信AppID／合法域名等环境。客户端allowed_actions、版本与隐藏文案不能替代服务端权限、关系和隐私复核。

【未完成】D批完整本人胶囊流程及E批联合／微信收口仍待实施。C批客户端路径与本端检查完成，真实H2未执行；首期不能因C批完成自动放行。共享进度、阻塞、联调台账未擅自修改，交由协调者据本记录同步；没有新增业务假设或改写已批准语义。
