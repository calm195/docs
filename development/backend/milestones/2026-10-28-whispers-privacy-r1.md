# 树洞匿名兼容与隐私恢复阶段记录

日期：2026-10-28（Asia/Shanghai）。状态：匿名兼容、注销清理与恢复重删完成，生产关闭。
任务：B07；需求：REQ-009、REQ-010、REQ-011、REQ-014、REQ-015、REQ-017、REQ-018、REQ-019、REQ-020。
契约：`whispers/1.0.0`，沿用已批准设计和固定契约，不修改原始需求、审批及 Wire 语义。

## 基点与范围

后端 `develop` 基点 `f267282810221bcd220c5d1a2f354645264bb0fd`；docs `backend-develop` 基点 `98185b866ffd9904136a8b9e138c02e66445c230`。开始时两工作区干净。沿用 docs 独立工作树，未切换主目录。源码提交按功能依赖顺序：`77474f68f139ac198c848b368d00979c8fd32398` → `92fd76e0a0063d6b6af5f36baa6cdfd56e4bd41a` → `8c2372edcb99abbe080352e4d1ade3e803e07e1b`。前序固定记录：[本人时空胶囊](2026-10-28-whispers-capsules-r1.md)。

## 实施与可测试边界

- opaque 黑名单：先回填历史随机标识，再显式单向切换；开关与树洞模块独立。所有来源条目只返回随机 block_id、版本、通用标签。POST 仅接受当前可访问公开来源；服务端在完整账号／关系／来源资源锁下解析。旧接口认证成功统一升级错误，非法会话仍 401；新 Me 去除旧动作。解除不复活旧关系或审核。
- 注销：独立删除日志先持久，受理事务撤销会话并隐藏本人帖子及整串评论、昵称公开快照；取消待审、解锁、通知和旧投递。评论者注销保留他人父帖。普通删除图覆盖新表、版本、别名、抱抱、审核、审计、回执和通知；限定证据独立。
- 幸存评论：暂停清理期间 body、recovery_body、post_id 均不回显。受控脱敏完成才保存 recovery_body；清除历史原稿及审核片段，解除父外键并保留 privacy_hold。重发必须新评论 ID、别名和普通审核；不恢复旧串。缺适配器或失败继续 processing。
- 恢复：既有独立日志（含已确认意图）重建屏障并再次执行删除；必须先完成重删／取消，再由恢复运维开放读取及外发。不把应用内清理等同 90 天备份或外部全版本物理全删。
- 前序补正：按批准设计明确胶囊活动额度仅计 scanning／review_pending／locked／isolated；已解锁、拒绝、取消及删除不计。通过新记录补证据，不改写 B06 固定记录。

## 验证与未完成边界

相关包、make fmt、make check（含 go vet 与全量 race／coverage）、make build、35 项 Python 入口回归已通过。独立 PostgreSQL 真实权限检查、迁移目录注释／权限重放／空库回退及旧版升级通过；三个 opaque 操作实际 Gin HTTP 响应通过固定 OpenAPI 校验，DELETE 为 204 无响应体。完整 `make integration` 的 18 项顶层用例全部通过，包含本次 8 项隐私子用例及旧模块回归；隔离业务库最终迁移版本 26。累计 50/50 个契约操作在隔离环境验证，正式生产均未启用。生产树洞保持关闭；正式进程装配、外部供应商与容量／三端联调仍按 B08、B09 推进。合成适配器和真实中间件边界将分别记录。


## 文件与实现取舍

完整文件清单及 SHA-256 随本次验证清单固定，主要包括：

- `internal/migration` 与 `internal/entity`：0026 单向策略、通知 suppressed 字段、仅限本人隐私评论的清理函数、一表一实体及权限；已应用迁移 0001–0025 未改写。
- `internal/blockpolicy`、`cmd/migrate`、`internal/safety`、`internal/studentauth`、`internal/httpapi`、`internal/whisper/blocks.go`：显式切换、认证优先的旧接口退出、新 Me 与三个 opaque 操作；来源解析与已有互动取消共用锁协议。
- `internal/privacy`：完整账号图、同步屏障、普通缓存引用定位、外部脱敏与版本复核、物理清理及独立日志恢复重删。
- `internal/whisper`：受屏障评论候选读取、本人撤回清理、通知抑制、活动额度修正及真实集成用例；根 README 维护启动与升级要求。

迁移默认不切换。两端完成升级后由迁移身份显式执行 `go run ./cmd/migrate opaque-blocks`；重放权限保留已切换状态，关闭树洞同样保留保护。已切换数据库拒绝 down。新匿名接口须与旧接口升级屏障同批部署。正式装配仍待 B08，不能通过仅开启 Config.Enabled 代替依赖验收。

清理延用专用隐私维护池。幸存作者撤回通过受限 SECURITY DEFINER 函数清除本人受屏障普通副本，函数复核有效会话、主体及隐私状态；普通 API 不直接获得原稿改写、扫描删除或审核决定更新权限。自动审批曾拒绝扩大这些直接权限，最终采用该受限实现，实际权限拒绝用例已通过。

通知在受理事务标记 suppressed，列表、读取及回执重放均复核。技术行保留至外部清理确认，通知、opaque 条目、幸存评论及其工作／回执随机引用通过 `privacy.Object.ReferenceOnly` 交付清理适配器；这类引用不作为对象存储密钥解密。脱敏结果在重新取得完整锁后比对评论版本，竞争时重试；父外键在完整删除图发现之后解除，避免丢失旧副本定位。

## 真实与合成边界

真实：隔离 Docker PostgreSQL、业务及独立恢复日志、迁移 SQL 与受限权限池、Gin HTTP、持久 work／outbox／回执、通知及恢复重删；完整集成另覆盖 Redis 与 RocketMQ 既有消息链。专项模拟恢复把隔离业务行保存于测试进程后重建旧快照，保留独立日志并验证已确认删除再次执行；不声称完成生产灾备演练。

合成：测试 AES KMS、文本安全与受控脱敏、外部全版本／缓存清理、供应商及通知。真实外部适配器未配置时状态继续 processing，故障／缺失不会回显旧稿或报告全副本已删。证据域保持独立，普通隐私身份不能读取；本次覆盖普通注销后限定证据保留，前序证据删除与恢复规则继续回归。

未完成范围：B08 正式进程装配、真实供应商与外部副本确认，B09 容量及三端联调。恢复运行必须在读取与外发开放前完成全量日志重删／取消；本次未部署、推送、合并或启用生产。


## 实际检查证据

| 检查 | 结果与证据 |
| --- | --- |
| 相关包／格式 | [check-fast](../validation/2026-10-28-whispers-privacy-check-fast-r1.txt)、[make fmt](../validation/2026-10-28-whispers-privacy-fmt-r1.txt) 通过 |
| 全量质量／构建 | [make check](../validation/2026-10-28-whispers-privacy-check-r1.txt)、[make build](../validation/2026-10-28-whispers-privacy-build-r1.txt) 通过 |
| 入口回归 | [Python 35 项](../validation/2026-10-28-whispers-privacy-entry-tests-r1.txt) 通过 |
| 真实数据库 | [32 项审核与领域检查，含本次 8 项](../validation/2026-10-28-whispers-privacy-postgres-r1.txt) 通过；[迁移回归](../validation/2026-10-28-whispers-privacy-migration-regression-r1.txt) 通过 |
| 中间件集成 | [make integration](../validation/2026-10-28-whispers-privacy-integration-r1.txt) 18 项顶层检查通过；收尾仅停止本任务容器、保留卷 |
| 固定契约 | [静态与实际响应检查](../validation/2026-10-28-whispers-privacy-contract-r1.txt)、[实际响应](../validation/2026-10-28-whispers-privacy-wire-r1.json) 通过；固定 50 操作／98 schema／75 样例／104 正例／12 负例／26 写动作未修改 |
| 交付范围 | [50 操作状态矩阵](../validation/2026-10-28-whispers-privacy-operations-r1.json)、[提交／文件／证据指纹](../validation/2026-10-28-whispers-privacy-r1.json) |
| 文档治理 | [本次文档检查](../validation/2026-10-28-whispers-privacy-doc-check-r1.txt)；既有 392 项指纹保持不变，本次追加固定 |

首次全量检查发现新策略表实体未登记，补齐后复跑全量质量、构建及真实迁移检查通过。其余实现调试复用本记录；最终证据均为修复后的实际执行结果。没有改写任何前序固定记录。
