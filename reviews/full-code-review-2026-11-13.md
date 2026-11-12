# 全仓代码审核与维护

审核时间：2026-11-12至2026-11-13，Asia/Shanghai。范围由用户批准的十步计划确定；执行中用户允许子代理，分别补充后端独立复审、管理端回归及小程序依赖兼容核对。三端源码修复已提交并推送至各仓库develop，完整SHA见下表；本轮未部署或上传。

## 范围与基线

| 仓库 | 完整基线SHA | 受跟踪条目 |
| --- | --- | --- |
| 总入口 | `71143e001566061685db242f3b6ea3abca154642` | 7（含4个子模块指针） |
| docs | `6fdc61aec3c32ece60249aa20aaf40315e83fd44` | 149 |
| Go后端 | `ed6a06ef970cb582102fb21005e72325f1fc3a7c` | 662，含567个Go文件、170个Go测试文件 |
| 管理端 | `5b688eab04ab8ccc3d21551c9a701887b10c288f` | 250，含59个Vitest测试文件 |
| 小程序 | `2f10b5cb2d078f519f2a486eddfd814507135296` | 299，含49个测试文件 |

本轮源码提交（均已推送至develop）：

| 仓库 | 完整提交SHA |
| --- | --- |
| Go后端 | `eae3c405e60493e661a181568c38fd045e463159` |
| 管理端 | `97896837eb6ec7d7ceb75925e11b5aa0c9b7cba9` |
| 小程序 | `4df976048c02fa03ab68da1402a19d94c697180f` |

合计1,367个受跟踪条目。以全仓清单、规则/引用扫描、静态分析、编译与自动回归覆盖仓库范围，人工详审集中于权限、事务/幂等、响应取消、资源所有权、媒体访问、持久任务和隐私恢复边界。第三方安装目录及构建产物通过锁文件、构建和依赖审计检查，私有配置不进入报告。未把静态扫描或测试通过表述为所有运行路径均已证明正确。

采用[Go代码评审约定](https://go.dev/wiki/CodeReviewComments)、[Vue组合式逻辑](https://vuejs.org/guide/reusability/composables.html)、[TypeScript严格检查](https://www.typescriptlang.org/tsconfig/strict.html)与[OWASP日志指南](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)，结合仓库AGENTS、现有模块边界和有效契约。格式化使用既有gofmt/ESLint/Prettier，检查规则及测试断言未被放宽。

## 问题与修复

| 优先级/类别 | 证据与影响 | 本轮处理 |
| --- | --- | --- |
| P1/依赖安全 | 官方govulncheck初始报告11条符号可达告警，涉及基线Go1.27.2标准库、pgx、x/net、x/text和quic-go；静态可达不等于已确认生产可利用 | 项目Go下限升至1.27.4，更新对应依赖并整理go.mod/go.sum；最终扫描无符号可达、导入或依赖模块漏洞告警 |
| P2/宿主退出 | RunServer忽略业务Close错误，共享资源关闭失败只写日志，最终可能以成功状态退出 | HTTP宿主逻辑移入app/http_server.go，统一清理完成日志及安全错误聚合；保留原始运行错误、逆序释放所有资源且不泄露底层凭据 |
| P2/会话隔离 | 小程序旧会话401及网络/上传失败仍进入全局提示；校验器在异步平台回调抛错可能不能拒绝原Promise | 平台回调只交付响应，协议处理移到await之后；所有迟到结果拒绝并抑制旧通知，本请求自身401仍正常清会话 |
| P2/前端边界与架构 | 七处后台请求重复实现会话/Headers/缓存/重定向，内容管理还依赖审核/词库传输文件 | session-transport统一后台请求边界，各领域保留状态/头部/正文校验和正文读取后的guard；content-request独立于审核/词库客户端 |
| P2/路径规范化 | 浏览器会移除部分原始控制符或尾空格，后台路径的字面校验与实际规范化可能不同 | 共用后台传输拒绝原始空白/控制字符、反斜线、片段与点段越界，覆盖越界路径及编码游标正常请求 |
| P2/依赖安全 | 管理端测试/lint传递依赖glob和minimatch共3条中危包告警 | 限定受影响范围锁定修复版本glob14.0.2、minimatch11.0.1，更新锁文件并重测 |
| P1/小程序依赖 | 官方配套编译链初始54个受影响包，包含上游漏洞的传递传播 | 六个DCloud编译包统一更新至稳定版3.0.0-5030420261029002，修复兼容传递依赖、Intlify原型污染并补齐YAML可选peer；最终26个受影响包仍开放，详细边界见下文 |
| P3/性能与冗余 | Staticcheck发现持久工作路由循环内重复编译固定正则、未使用测试handler、无效赋值及冗余fmt.Sprintf | 固定正则预编译，删除无调用测试适配和无效赋值，保留行为断言 |
| P2/文档 | 三端现状/缺陷/计划累计1,989行，重复追加旧部署、旧迁移、旧开发版与已关闭问题，影响当前判断 | 按模块和开放项收敛为九份滚动文档；已有生产/上传证据与本轮工作区分开，合并跨端依赖顺序，补契约检查环境和Go要求 |

安全版本依据包括[Go1.27.4发布说明](https://go.dev/doc/devel/release#go1.27.0)及[pgx公告GO-2026-5004](https://pkg.go.dev/vuln/GO-2026-5004)。本轮未重写SQL迁移、密钥用途标签、鉴权语义或幂等协议；注释集中补充会话隔离、取消、关闭和资源所有权的原因。新增日志使用注入zap、固定操作名/结果/耗时，不回显凭据、DSN、请求体或个人正文。

## 覆盖矩阵

| 范围 | 主要核对与自动验证 |
| --- | --- |
| 配置/入口/资源 | YAML、命令参数、运行装配、包依赖白名单、foundation启动、资源关闭与恢复门禁；runtime和架构/生命周期测试 |
| 认证/账号/字典 | 会话、岗位、学生卡、身份占用、教育信息、头像、版本与原键重试；adminauth/studentauth/studentcard/verification/identity/dictionary/moduleguide专项 |
| 心愿/聊天/互动 | 草稿、发布/回退、图文授权、评论/通知、支持/收藏/浏览、应用/匹配/聊天/还愿；wish_draft/wish_lifecycle/wish_http及moderation专项 |
| 树洞/安全/隐私 | 匿名身份、胶囊、举报、危机、处罚/申诉、两域删除与恢复、图片清理；whisper_text/whisper_review/moderation/wish_images_cleanup专项 |
| 包分配 | 报名/任务库/特质、半分评分、持久预览、确认并发、注销清理；matchmaking/matchmaking_auto_concurrency/matchmaking_privacy专项 |
| 执行/迁移/资料 | 命令锁/事务/幂等、工作租约/补偿、迁移上下行与权限、资料协议；command/durable/migration/resourceplaza/redis_rate专项 |
| 管理端 | 服务层契约、共享传输、页面/组合函数、会话与Blob清理、稳定幂等请求；完整单元/规范测试及相关本机合成浏览器链 |
| 小程序 | 请求、会话/可见性、草稿、图片队列、导航、通知、JSON兼容、原生API边界；全部测试及微信生产构建 |
| 文档/工具 | 当前链接/锚点、固定输入及历史Git快照、契约manifest、Python检查工具；保留原始需求/审批/有效契约指纹 |

## 本轮验证

以下验证对应本轮源码提交的代码与依赖；测试完成后仅继续整理文档，提交操作未更改源码内容。

| 检查 | 实际结果 |
| --- | --- |
| 后端格式、vet、race/cover、构建 | 最终依赖组合全部通过；go mod tidy/verify通过 |
| Staticcheck v0.8.2 | 通过，无报告 |
| govulncheck v1.9.0 | 通过，无漏洞告警 |
| 原生PostgreSQL/Redis | 最终依赖组合全部23组专项、48个必需顶层用例通过，临时服务已清理 |
| 后端Python工具 | 21项通过 |
| 管理端 | format/check/build通过；60个文件878项Vitest、58项ESLint规则测试和8组浏览器回归全部通过；305个依赖审计0漏洞 |
| 小程序 | npm ci锁文件重装、format/check、357项测试、微信构建、npm ls --all全部通过；ZIP/JPEG、DCloud Jimp及Intlify消息转换/原型污染拒绝兼容验证通过；审计26个受影响包 |
| 文档 | 整理后6项工具测试、当前文档/固定输入、契约检查全部通过 |

原生集成仅创建本轮临时PG/Redis并清理自己的数据，未操作现有开发库或生产库；外部审核/对象/微信为合成适配。普通go test会跳过显式外部依赖用例；不把跳过计为通过。浏览器脚本使用本机服务及合成路由，不替代真实岗位验收。

## 文档收敛与剩余边界

三端仍各保留README/defects/plan三份，现状分别写本轮提交SHA与已有交付基线，缺陷只留开放项，计划写依赖与关闭标准。原文可从[本轮整理前Git快照](https://github.com/calm195/docs/tree/6fdc61aec3c32ece60249aa20aaf40315e83fd44/development)追溯；固定历史文件和governance清单未改写，没有新增过程归档目录。

最后已记录部署仍为2026-11-12的后端/管理端基线，小程序最后已有上传记录为1.0.30-notice.20261112。本轮未连接生产或微信平台重新核验，也未发布本轮安全修复。真实供应商全场景、正式岗位/微信双账号、iOS/Android、目标性能/容量和独立备份恢复按各端缺口保持开放。

## 小程序上游依赖风险

依据[DCloud CLI文档](https://uniapp.dcloud.net.cn/quickstart-cli.html)、[官方Vue3 TypeScript模板](https://github.com/dcloudio/uni-preset-vue/tree/vite-ts)及插件npm元数据，六个编译包保持同版 `3.0.0-5030420261029002`，配套Vite `5.2.8`、Vue `3.4.21`。兼容安全补丁覆盖Babel、ZIP、Express、图像解码、路径/样式解析与WebSocket，具体版本由package.json和锁文件固定；没有采用audit建议的旧DCloud降级或分离强升编译框架。

官方npm审计由54个受影响包（24高危、18中危、12低危）降至26个（13高危、13中危，0严重/低危）。包计数包含同一漏洞沿DCloud依赖链传播，不等于26个独立漏洞；其中9个被标记为直接依赖，即六个DCloud编译包、Vite、Vue和vue-i18n。嵌套Intlify core-base/message-resolver由9.1.9补至9.1.11后，原型污染公告已消除；补丁导出API一致并通过正常转换与攻击拒绝验证。

| 剩余依赖 | 风险及当前边界 |
| --- | --- |
| Vite / esbuild | 含开发服务文件读取/跨源访问、编辑器调用及构建产物DOM clobbering等公告；H5服务改为127.0.0.1并禁用CORS，不能视为修复全部风险。示例公告：[Vite构建产物](https://github.com/advisories/GHSA-64vr-g452-qvp3)、[esbuild开发服务](https://github.com/advisories/GHSA-67mh-4wv8-2f99) |
| Vue / server-renderer | [SSR属性名处理XSS](https://github.com/advisories/GHSA-g2v6-rqmx-r4w6)；当前微信构建不执行SSR，依赖漏洞仍存在 |
| vue-i18n / intlify | 剩余翻译参数XSS等告警，9.x没有完整修复组合；不得仅凭微信构建成功推断安全。示例公告：[翻译参数转义](https://github.com/advisories/GHSA-8rc2-428q-7ww3) |
| Jimp / phin | [旧下载器跨重定向泄露请求头](https://github.com/advisories/GHSA-x565-32qp-m3vf)；保留官方Jimp API，仅修复JPEG解码依赖 |

剩余项记录为[MP-09](../development/miniprogram/defects.md)，需由兼容上游更新关闭；完整构建、真机回归和重新审计共同作为验收条件。后端和管理端本轮扫描清零仅代表所用工具及当次漏洞库结果，不是永久安全保证。
