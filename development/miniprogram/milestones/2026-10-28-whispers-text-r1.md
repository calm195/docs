# 悄悄鲤第二批：文字树洞、匿名身份、发帖与我的记录 r1

日期：2026-10-28（Asia/Shanghai）。状态：计划 B 批本端实现与检查完成，真实 H1 联调未执行；不代表首期整体完成、人工验收或上线批准。

## 1. 依据与精确提交

【事实】用户授权按既定计划继续第二批开发、同步文档、运行规定检查，并按模块依赖顺序提交。依据[开发计划](2026-10-27-whispers-development-plan-r1.md)、[第一批交付](2026-10-27-whispers-foundation-r1.md)、[需求](../../../requirements/whispers-v1.md)、[批准范围](../../../approvals/2026-10-27-whispers-scope.md)及[详细设计](../../../design/whispers-v1/README.md)。本次覆盖 WM-02、WM-03、WM-06 的公共解忧／举报，以及 WM-04 的本人评论读取／撤回与评论只读基础；不扩展业务需求。

开始修改前核对源码 develop / `6281f8a652ba964845a6df09b62677a877b63dbf` 与 docs mini-deveop / `c816edcf8b55179662df5185fb38870ed436774a` 均干净。保留 docs 主检出，在 `/private/tmp/liyuanci-docs-mini-deveop` 工作树完成文档；docs 基点为上述 c816edc 完整提交。

源码按依赖顺序已提交：

| 顺序／模块 | develop 完整提交 |
| --- | --- |
| 共享页面作用域、分页、文字／身份校验与展示组件 | `3819eeb17221934f4577b7a2176f8846e07329e0` |
| 首页最新区、公开广场／详情、解忧／举报入口 | `2486dc34c39381d4282eed3f47382ebbfbac5095` |
| 发帖、独立昵称、本人记录、页面注册与本批回归测试 | `84aa0a6f9167226fafd38df55a371b6980abb7e0` |

本批为依次相接的整体交付，页面注册与综合测试在最后一个提交汇合；质量结论针对最终完整源码，未逐个声明中间提交独立完成页面闭环。没有推送、合并、部署或上线。

固定消费 `whispers/1.0.0`，未改写契约：OpenAPI SHA-256 `f4cc52d540dcc761a3d63a1ea47f8e371f3bd2ea87bb9caddf812153ee1101a0`；actions `d28f5a8088e321081d2280ca5e8a80b44ea215ffb1e8f605b181d6a3f50d708b`；examples `cf29bcf6072e2d9fa07904f48b84a33c5f806bbb63ec4345e9a71d923d274683`。各变更文件指纹与命令结果见[验证元数据](../validation/2026-10-28-whispers-text-r1.json)。

## 2. 变更与验收映射

| 文件／模块 | 实现及可测试验收 |
| --- | --- |
| `src/composables/use-whisper-page.ts` | 页面可见性／会话代次隔离；离页、同账号换会话及切账号清稿、清正文和待重试体；晚到响应不回填；写入互斥，结果未知仅本页原键原体重试，403／404／409刷新当前状态后由用户决定。REQ-018／WI-17 |
| `src/utils/whisper-content.ts` | 正文500码点、昵称2至20码点，不隐式trim或规范化；拒绝空白与孤立代理项；三档身份参数与当前字典／active昵称版本绑定；游标去重与循环检测；审核及隐私状态中文文案。REQ-009／W009-A至E |
| `src/stores/whispers.ts`、`src/composables/use-whisper-feed.ts` | 公共配置可单独刷新，公开读取不依赖私有Workspace；空页有next_cursor仍可继续，null才结束；共享store不存正文。REQ-009／WI-01、02 |
| `src/components/WhisperContent.vue`、`WhisperIdentity.vue` | 普通文本展示、无作者账号／主页跳转；年级显示受控字典标签；半匿名缺字典禁用，校区／性别／年级无默认推断，标签由本人明确选择；昵称仅active可用，candidate不可发布。三档展示预览不冒充服务端最终公开投影。REQ-009／W009-B、D、E |
| `src/pages/index/index.vue`、`src/pages/whispers/index.vue` | 首页最新3条、独立文字树洞广场、下一页／刷新、空态／失败／停用态；只有已读取启用配置并成功加载后显示首页广场入口。游客可公开读取。REQ-009／WI-01 |
| `src/pages/whispers/detail.vue` | 当前公开帖与单层暖评只读；分页重验父帖正文版本及评论开关代次；404／上下文冲突清旧串；关闭评论保留公开合规评论只读；屏蔽仅传当前来源引用及content_version，无匿名作者映射。REQ-009、REQ-010、REQ-014／WI-02、04、07 |
| `src/pages/whispers/editor.vue` | 保存草稿与显式提交审核分开；未保存修改不能提交；expected_version来自当前OwnerPost；改稿提示整帖撤公开后重审；撤回不自动重提；评论开关采用最新资源版本；privacy_hold不回显正文；学生认证与allowed_actions控制入口。REQ-009、REQ-010／WI-01、02、04 |
| `src/pages/whispers/nickname.vue` | 独立昵称候选提交使用NicknameState.version；active与candidate分别展示、审核原因与建议可读；旧active不被待审候选覆盖。REQ-009／WI-09 |
| `src/pages/whispers/mine.vue` | 本人帖子／评论页签隔离分页，展示状态、审核原因建议；管理帖子与撤回本人评论；post_id=null不回旧串，只有后端提供recovery_body时展示安全候选，不能自动迁移或重发。REQ-009、REQ-010、REQ-018／WI-13、14 |
| `src/pages/whispers/help.vue`、`report.vue` | 无需登录的公共援助目录显示来源、版本、核验日期，缺资源保持unavailable；与需本人登录的关怀卡分开。举报类型来自配置，发送前重读来源，取当前content_version；评论来源校验父正文版本，只提交契约规定的source和type_code。REQ-011、REQ-014／WI-06、08 |
| `src/pages.json`、`tests/whisper-pages.test.ts` | 注册7个页面；新增15项实际页面脚本／身份组件测试，复用正式样例派生数据、实际API及scope，仅替换平台与传输；既有145项测试保持通过。REQ-009、REQ-010、REQ-011、REQ-014、REQ-018 |

## 3. 检查与修复事实

| 命令 | 实际结果／证据 |
| --- | --- |
| `npm run format` 后重新 `npm run check` | 退出码0；ESLint、Prettier、vue-tsc和160项测试全部通过，含新增15项；[完整日志](../validation/2026-10-28-whispers-text-r1-check.txt) |
| `npm run build:mp-weixin` | 退出码0，Build complete；提示未配置AppID、uni统计不可用；[构建日志](../validation/2026-10-28-whispers-text-r1-build.txt) |
| 三次源码暂存范围 `git diff --cached --check`、最终 `git diff --check` | 均退出码0；提交范围仅本批源码与测试 |
| `python3 scripts/check_documents.py --base c816edcf8b55179662df5185fb38870ed436774a`、固定指纹及文档空白检查 | [本次文档检查](../validation/2026-10-28-whispers-text-r1-docs.txt)；清单只追加新记录与证据，旧固定文件不变 |

【事实】迭代中修复组件类型问题、测试数据赋值类型及举报额外description字段；固定ReportCreate只接受source与type_code，因此删除不在契约内的输入项，未扩展共享协议。身份输入不默认选择校区／性别，比较已保存身份按字段判断，避免JSON字段顺序造成误判。未关闭lint、忽略源码或删除原有测试绕过门槛。

【环境事件】跨日收尾时发现临时docs工作树的Git关联及207个受跟踪文件缺失；本次新增记录、日志和索引修改仍在。恢复原Git关联后，仅从当前HEAD恢复缺失文件，未覆盖现存修改；随后文档检查确认原330个固定文件指纹全部符合基点。首次文档命令因脚本缺失退出2，恢复后完整重跑通过；该事件不改变源码或旧固定记录。交付记录按实际收尾日期2026-10-28命名。

## 4. 真实边界、未完成项与依赖

【事实】运行时接真实请求适配，不新增默认成功Mock；合成模式明确显示需连接真实服务。测试使用合成数据及替代传输，不包含真实用户数据、令牌或正文。没有执行真实HTTP、审核供应商／数据库、微信开发者工具、真机、双主题视觉、性能、物理清理或备份恢复验证；本端构建通过不能替代这些证据。

【依赖】H1需要后端可用的精确HTTP交接版本、隔离测试身份、审核前后操作、真实错误／版本／动作和opaque-v1迁移启用证据。实际年级字典缺失时半匿名不可选，保留首期依赖；公共援助目录未核验时只显示不可用，不编造资源。学生认证、隐藏优先、匿名别名分配、内容撤公开、幂等和隐私屏障最终由后端落实，本端仅消费授权投影。本轮未修改后端或共享滚动台账，也不宣称后端已完成交接。

【未完成范围】C批暖评新建／编辑、目标态抱抱和模块通知；D批本人胶囊；E批真实联合与微信环境收口。当前我的评论提供读取／撤回和安全候选展示，尚无重新新建评论操作。首期三档匿名、互动、胶囊与安全治理仍按原计划完成并分别核销，不能将B批通过视为首期放行。

【建议下一步】依计划进入C批，复用本次身份组件、详情上下文、我的评论页签和页面作用域；真实联调按后端交接情况推进，缺失前置仅停止依赖它的验证。无新增需求假设或需修改批准语义的问题。
