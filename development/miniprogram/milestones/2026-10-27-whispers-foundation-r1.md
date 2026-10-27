# 悄悄鲤第一批：契约、会话与黑名单迁移 r1

日期：2026-10-27（Asia/Shanghai）。任务：WM-01、WM-07；关联 REQ-009、REQ-010、REQ-011、REQ-014、REQ-018、REQ-020。状态：**小程序本端实现、质量检查与生产构建完成，真实 opaque-v1 交接及联调未验证**；不宣称树洞首期完成、真实安全验收或上线放行。

## 1. 依据、基点与提交

依据[本端开发计划](2026-10-27-whispers-development-plan-r1.md)、[需求增量](../../../requirements/whispers-v1.md)、[接口语义](../../../design/whispers-v1/api.md)、[三端工作包](../../../design/whispers-v1/delivery.md)与[固定契约](../../../contracts/whispers-v1/README.md)。本次只实施计划 A 批，不修改需求、共享契约、批准或固定历史。

【事实】开始前源码 `develop / c83904d7f46f6418f0712135b78d65f44a6d7667` 干净。docs 使用独立工作树 `/private/tmp/liyuanci-docs-mini-deveop` 的 `mini-deveop / 54134983658bb2ad5e29b43523ab27721379878e`；已有上一轮计划、验证、索引与固定清单改动，原样保留并随本轮归档。docs 主检出未切换。原计划 SHA-256 为 `f53b7689ff93899b1077bfb66a2730731fb302449b35403374309f63e05e9824`，本轮不改写其规划状态。

用户本轮明确要求完成后按模块与依赖顺序提交代码。源码按以下顺序提交，先基础、后依赖该基础的页面迁移；两次均检查暂存范围，没有混入后端或其他任务改动：

| 顺序 | develop 完整提交 | 范围 |
| --- | --- | --- |
| 1 | `a3fbae710ec620786f31d7b46964f01678132846` | 契约派生工具、32项学生端类型／校验／API、动作与版本工具、内存作用域、Pinia配置与Workspace、正式合成夹具及基础测试 |
| 2 | `6281f8a652ba964845a6df09b62677a877b63dbf` | 黑名单API／类型／设置页迁移、现有来源入口适配、回归测试及README用法说明 |

最终源码工作区干净；完整质量检查针对最终合并工作区执行，之后仅按功能分两次提交，未改变被测试源码字节。不是声称在第一个中间提交上单独重跑了整套检查。docs 本次记录在上述源码提交后补全，待本轮 docs 提交归档；不自动推送、合并、部署或启用功能。

消费版本为 `whispers/1.0.0`：OpenAPI SHA-256 `f4cc52d540dcc761a3d63a1ea47f8e371f3bd2ea87bb9caddf812153ee1101a0`，actions SHA-256 `d28f5a8088e321081d2280ca5e8a80b44ea215ffb1e8f605b181d6a3f50d708b`。完整输入、15个源码变更文件指纹及32项operationId目录见[验证元数据](../validation/2026-10-27-whispers-foundation-r1.json)。原全站0.2.1及本模块固定输入均未改写。

## 2. 已实现范围与文件

| 文件／模块 | 实现与业务边界 |
| --- | --- |
| `scripts/sync_whispers_contract.py` | 只读校验manifest中的OpenAPI／actions指纹，提取学生端依赖schema，生成类型与运行时目录，调用本地Prettier；不升级依赖，不加载管理端接口或将样例写入生产路径 |
| `src/types/whispers.ts`、`src/utils/whispers-contract.ts` | 固定契约的32项学生端操作、请求／返回类型、schema及学生写动作目录；保留required／nullable／enum／额外字段限制和条件约束 |
| `src/utils/whispers-schema.ts`、`src/api/whispers.ts` | 严格验证Unicode码点／孤立代理项、UUID、时间、字段、枚举、动作及条件屏障；统一request发送，支持202受理和204／DELETE JSON版本；输入快照及会话代次阻断晚到响应；返回格式异常不向页面透传正文 |
| `src/utils/whispers.ts` | 按合法投影关闭未知动作，按本人／父帖／抱抱记录提取独立版本；UUID幂等键；页面内存草稿与结果未知请求作用域，禁止未确认时另起写入，原键原体显式重试；离页close及同账号换会话立即清理 |
| `src/stores/whispers.ts` | Pinia共享模块配置与本人Workspace，代次隔离并发／晚到读取；账号或会话变化立即清配置与动作，不跨页面保存正文、草稿、游标或重试体。后续树洞页面按该基础接入 |
| `src/api/settings.ts`、`src/types/settings.ts` | 全来源列表和解除迁移为 `/me/interaction-blocks`、`block_id`及条目版本；创建使用SourceRef，只收通用accepted回执；移除target_user_id类型与旧路由调用 |
| `src/pages/settings/index.vue` | 新增Workspace与BlockEntry动作来源，不依赖旧Me黑名单动作；按block_id去重和解除；移除列表账号主页／来源映射；保留公开主页、心愿、故事来源的当前投影重验，创建统一使用可访问public_profile引用，后端继续复核；升级提示不回退旧API；未知结果本页原请求重试；会话变化物理清理缓存 |
| `tests/whispers.test.ts`、`tests/fixtures/whispers.json`、`tests/support/whispers-runtime.ts`、`tests/settings.test.ts` | 消费正式合成正反夹具，执行实际API／页面脚本，替换平台／会话／传输边界；覆盖所有32项方法／路径、写入参数与UUID键、字段泄漏、权限与版本、结果未知、升级和会话清理 |
| 根 `README.md` | 增加生成方式、作用域生命周期与新黑名单接入须知；过程材料仍只在docs |

公开主页、公开心愿与故事原有导航仍进入设置页；实际创建动作已在设置页整体迁移，不再通过旧入口发送账号目标。公开主页ID是用户已可访问的显式来源，不从匿名内容推导；新列表不将任意匿名目标映射回来源。新树洞来源将在后续详情页按PublicPost／PublicComment动作接入，不新增占位入口。

## 3. 验收与实际检查

| 验收点 | 本次结果／证据 |
| --- | --- |
| 32项学生端请求与响应、所有写操作UUID键／版本体、DELETE JSON与204 | 正式合成exchanges逐项执行API适配，方法／路径与样例核对；正反schema夹具通过；这是客户端消费测试，不是后端实现测试 |
| W009-B、W011-A、W014-B 的泄漏负例 | 公共author_id／未知字段、旧黑名单target_user_id、锁定胶囊正文、privacy_hold原文和未知动作均拒绝消费 |
| WI-16、17 的会话／弱网消费部分 | 旧会话及同账号换会话晚到响应不可回填；离页／换会话清草稿和待重试体；超时只原键原体重试；最终状态冲突不自动重放 |
| W014-A、B／WI-07 的本端部分 | 列表无账号链接，条目版本解除；旧Me动作不启用新写；升级响应清缓存且无旧路由回退；旧关系迁移及心愿／私聊服务端限制仍须真实联调 |
| 质量门槛 | `npm run check` 退出码0：ESLint、Prettier、vue-tsc与145项测试全部通过；见[完整日志](../validation/2026-10-27-whispers-foundation-r1-check.txt) |
| 微信构建 | `npm run build:mp-weixin` 退出码0，Build complete；见[构建日志](../validation/2026-10-27-whispers-foundation-r1-build.txt)。构建提示未配置AppID、uni统计不可用；不代表真实微信认证或真机通过 |
| 生成一致性 | 重跑同步脚本退出码0，两个生成文件前后SHA-256相同；见[生成证据](../validation/2026-10-27-whispers-foundation-r1-contract.txt) |
| 差异与文档 | 两个源码暂存范围各自 `git diff --cached --check` 通过，最终源码 `git diff --check` 通过；docs文档／链接／固定指纹及新增文件空白检查见[文档检查](../validation/2026-10-27-whispers-foundation-r1-docs.txt) |

首次迭代检查发现空对象类型lint、类型兼容、测试将显式GET误计为写入及204样例无响应项等问题，均已修复并完整复跑；格式统一使用 `npm run format` 后复跑完整check。没有降低规则、删除原有行为测试或增加生产Mock成功路径。检查后重新生成字节相同，因此没有为相同文件重复产品测试。

## 4. 未完成、依赖与启用风险

【事实】本次未执行真实HTTP／数据库／审核供应商／微信工具／真机／恢复／性能验证。测试仅使用正式合成样例和替代传输；client的allowed_actions与版本控制不能代替服务端权限、幂等或隐私屏障。

【事实】只读观察后端 `develop / 4517d9bee3c25b57a1bf52c9be4da859dfef8b73` 工作区有command及whisper进行中改动；本轮未修改、提交或重置这些文件，也未取得真实HTTP路由、迁移、worker、测试身份与opaque-v1启用的交接证据。不把进行中的领域代码当作HTTP可用或旧黑名单已退出。

【依赖】黑名单接线需要后端提供全部旧关系的block_id投影、对应Workspace和条目动作、旧GET／POST／DELETE统一升级行为，以及原心愿申请／私聊限制回归证据。新接口未就绪时本端黑名单显示不可读取，资料编辑仍独立可用；为保护匿名身份不回退target_user_id。部署需协调客户端升级与opaque模式，不能只发布前端并宣称现有关系真实迁移完成。

【未完成范围】计划 B–E：首页／树洞页面、三档匿名交互、发帖／昵称、暖评／抱抱、通知／举报／公共解忧消费、本人胶囊页面及联合收口均未实施；第一批只提供其协议与状态基础。实际字典、援助目录、正式安全与隐私适配、隔离联调身份及微信环境仍按原计划交接。首期不可因本端A批完成宣称整体完成。

【建议下一步】按计划进入 B 批文字闭环，复用本次API、版本／动作、store与页面作用域；可先完成本端隔离测试，真实H1等待后端交接。后续按用户授权在每轮完成后依模块与依赖顺序提交源码，再同步精确提交并提交docs；不自动推送、合并或上线。
