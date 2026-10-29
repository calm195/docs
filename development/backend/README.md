# 后端文档索引

对应工程：`liyuanci-backend-go`。关联 T001–T004、REQ-001、REQ-018、REQ-020；具体业务 REQ 及验收映射以各记录为准。

本目录迁入文件是 2026-10-22 整理时的固定快照，保留历史状态及测试结论；不因归档宣称当前功能验收通过。后续按日期/主题/revision 新增记录，补充与勘误引用原文；只更新本索引入口。参见[统一规范](../../governance/README.md)。

## 实施与接入说明

- [资料广场本地环境启动与联调](milestones/2026-10-29-resource-plaza-local-start-r1.md)：迁移29、API与配套进程已启动，管理端真实HTTP流程通过；微信结果见小程序开发分支独立记录。

- [资料广场后端实现与独立验证](milestones/2026-10-29-resource-plaza-implementation-r1.md)：15操作、真实PG/HTTP及隐私恢复重删通过，消费[1.0.1](../../contracts/resource-plaza-v1-r2/README.md)，源码未提交；三端真实联调未执行。

- [资料广场后端独立工作包](milestones/2026-10-29-resource-plaza-development-r1.md)、[正式契约 resource-plaza/1.0.0](../../contracts/resource-plaza-v1/README.md)、[总交接](../../design/resource-plaza-contract-delivery-v1.md)；15接口、认证读取、资料/分类维护、四类反馈及隐私清理，正式输入已固定，尚未实现。

- [管理端用户查询测试数据：32账号与40条合成处罚](milestones/2026-10-29-admin-users-test-data-r1.md)；在用户管理搜索“联调测试”使用。

- [后台用户查询精确提交与本地启动](milestones/2026-10-29-admin-users-commit-start-r1.md)；源码 `develop` / `ca9f68ac51285dafee88431d7610d9856e394985`，本地 API 与配套 worker 已启动供管理端调试；[原始日志提交检查补证](validation/2026-10-29-admin-users-commit-check-r1.md)。
- [后台用户查询实现、0027迁移与验证](milestones/2026-10-29-admin-users-implementation-r1.md)；对应 admin-users/1.0.0，保留实现时未提交的历史快照，提交关联见上述补充记录。

- [用户管理独立开发工作包（含昵称搜索）](milestones/2026-10-29-admin-users-development-r1.md)、[共享契约 admin-users/1.0.0](../../contracts/admin-users-v1/README.md)、[两端交付与联调矩阵](../../design/admin-users-delivery-v1.md)；设计产物，不代表接口已实现。

- [三端真实联调操作手册：前置条件、阻塞、启动与WI逐项标准](milestones/2026-10-28-real-integration-runbook-r1.md)；配套[管理端页面步骤](../admin/milestones/2026-10-28-real-integration-runbook-r1.md)、[小程序登录与真机步骤](../miniprogram/milestones/2026-10-28-real-integration-runbook-r1.md)。
- 共享输入：[需求基线](../../requirements/baseline.md)、[树洞需求](../../requirements/whispers-v1.md)、[契约导航](../../contracts/navigation.md)、[树洞契约](../../contracts/whispers-v1/README.md)、[进度](../../plans/progress.md)、[阻塞](../../plans/blockers.md)、[联调台账](../../plans/integration-log.md)。

- [宿主API/业务worker、原生或Docker中间件及诊断（当前入口）](host-development.md)

- [后台账号与会话操作](admin-auth.md)
- [学生应用与学生卡 worker 显式装配](application-assembly.md)
- [业务结构、迁移与权限边界](business-schema.md)
- [T001–T004 实施新增文件（含T004续验）](change-files.md)
- [数据库事务与授权命令入口](command-framework.md)
- [B02–B07 契约缺口协调提案](contract-coordination-2026-10-21.md)
- [契约收口及后台隔离联调交接](contract-int003-handoff-2026-10-21.md)
- [数据迁移与加密基础](data-foundation.md)
- [外部依赖交付清单与剩余范围](dependency-deliverables.md)
- [开发业务启动与边界](development-business.md)
- [Docker 中间件与官方管理工具](docker-middleware.md)
- [T003 环境与D01–D06清单](environment.md)
- [foundation-manifest.json](foundation-manifest.json)
- [第一批实施状态与交接](implementation.md)
- [input-verification.json](input-verification.json)
- [R2 后台身份局部联调准入包](int003-r2-readiness.md)
- [中间件版本决定：采用 RocketMQ 5.3.2](middleware-decision.md)
- [统一可观测性实施（T004/REQ-018、020）](observability.md)
- [启动与停止脚本（T004/REQ-018、020）](operations.md)
- [学生微信身份与会话](student-auth.md)
- [学生卡上传和扫描模块](student-card.md)
- [T004 后端续验（2026-10-17）](t004-followup.md)
- [t004-integration-evidence.json](t004-integration-evidence.json)
- [第一批实际验证记录](validation.md)
- [人工认证模块](verification.md)
- [心愿领域、生命周期与查询](wish.md)

## 固定阶段记录

- [ORM 实体与自动迁移重构（2026-10-21）](milestones/orm-refactor-2026-10-21.md)
- [第一阶段：工程基础与开发运维](milestones/phase-01.md)
- [第二阶段：数据与安全基础](milestones/phase-02.md)
- [第三阶段：事务与授权命令框架](milestones/phase-03.md)
- [第四阶段：持久工作与消息链路](milestones/phase-04.md)
- [第五阶段：后台本地账号与会话](milestones/phase-05.md)
- [第六阶段：学生卡上传与扫描](milestones/phase-06.md)
- [第七阶段：人工认证申请、重提与后台审核](milestones/phase-07.md)
- [第八阶段：学生应用与领域 worker 装配](milestones/phase-08.md)
- [第九阶段：心愿领域规则](milestones/phase-09.md)
- [第十阶段：开发业务启动接线](milestones/phase-10.md)
- [消息运输适配验证快照](milestones/t007-mq-validation-2026-10-21.md)

## 后续记录

- [2026-10-22 文档归属与规则治理](milestones/2026-10-22-docs-governance-r1.md)

- [2026-10-22 宿主开发体验优化](milestones/2026-10-22-host-development-r1.md)

- [2026-10-22 原生PostgreSQL与Redis开发方式](milestones/2026-10-22-native-middleware-r1.md)

- [2026-10-22 开发目录、配置与资源清理](milestones/2026-10-22-dev-layout-r1.md)

- [2026-10-22 宿主开发与配置整理精确源码提交补充](milestones/2026-10-22-host-development-commit-r1.md)

- [2026-10-22 业务消息链路收口与真实领域验证](milestones/2026-10-22-business-message-chain-r1.md)

- [2026-10-22 业务消息链路精确源码提交补充](milestones/2026-10-22-business-message-chain-commit-r1.md)

- [2026-10-22 内容扫描、词库与人工复核核心](milestones/2026-10-22-content-moderation-r1.md)

- [2026-10-22 内容扫描与人工复核核心精确源码提交补充](milestones/2026-10-22-content-moderation-commit-r1.md)

- [2026-10-22 内容常驻工作进程、生命周期与补偿预算修复](milestones/2026-10-22-content-worker-r1.md)

- [2026-10-22 应愿申请、唯一匹配与普通回退](milestones/2026-10-22-application-matching-r1.md)

- [2026-10-22 聊天、站内通知及最终送达序号](milestones/2026-10-22-chat-delivery-r1.md)

- [2026-10-22 确认实现、还愿故事与分享重验](milestones/2026-10-22-story-sharing-r1.md)

- [2026-10-22 拉黑、举报、处罚、警告与申诉服务](milestones/2026-10-22-safety-governance-r1.md)

- [2026-10-23 危机案件、限定证据与关怀服务](milestones/2026-10-23-crisis-care-r1.md)

- [2026-10-23 注销、隐私屏障、普通清理与证据删除](milestones/2026-10-23-privacy-deletion-r1.md)

- [2026-10-23 原文人工审核与本地开发服务启动](milestones/2026-10-23-manual-review-startup-r1.md)

- [2026-10-23 原文人工审核精确源码提交补充](milestones/2026-10-23-manual-review-commit-r1.md)

- [2026-10-23 本地危机后台身份与管理端联调接入](milestones/2026-10-23-local-crisis-api-r1.md)

- [2026-10-23 本地危机后台精确源码提交补充](milestones/2026-10-23-local-crisis-commit-r1.md)

- [2026-10-23 本地隐私后台与全模块联调启动](milestones/2026-10-23-local-privacy-startup-r1.md)

- [2026-10-23 本地隐私删除与联调启动精确源码提交补充](milestones/2026-10-23-local-privacy-commit-r1.md)

- [2026-10-23 后端联调启动交付合入 main](milestones/2026-10-23-main-merge-r1.md)

- [2026-10-27 小程序公开主页实现与认证发布准入回报](milestones/2026-10-27-public-profile-p0-r1.md)

- [2026-10-27 公开主页精确源码提交补充](milestones/2026-10-27-public-profile-commit-r1.md)

- [2026-10-27 公开主页提交检查补充说明](milestones/2026-10-27-public-profile-commit-r2.md)

- [2026-10-27 黑名单契约与正式解除动作统一](milestones/2026-10-27-blocks-contract-r1.md)

- [2026-10-27 黑名单契约精确提交与合流交接](milestones/2026-10-27-blocks-commit-r1.md)

- [2026-10-27 公开主页与黑名单交付合入main](milestones/2026-10-27-main-merge-r1.md)

- [2026-10-27 悄悄鲤后端开发计划](milestones/2026-10-27-whispers-backend-plan-r1.md)

- [2026-10-27 悄悄鲤输入对照与数据命令基础](milestones/2026-10-27-whispers-foundation-r1.md)

- [2026-10-27 树洞基础源码提交补证](milestones/2026-10-27-whispers-foundation-commit-r1.md)

- [2026-10-28 悄悄鲤文字、身份与昵称领域](milestones/2026-10-28-whispers-text-r1.md)（[文档检查补证](validation/2026-10-28-whispers-text-doc-check-r1.txt)）

- [2026-10-28 悄悄鲤审核、危机与治理](milestones/2026-10-28-whispers-governance-r1.md)（[验证清单](validation/2026-10-28-whispers-governance-r1.json)）

- [2026-10-28 悄悄鲤暖评、抱抱与通知](milestones/2026-10-28-whispers-interactions-r1.md)（[验证清单](validation/2026-10-28-whispers-interactions-r1.json)）

- [2026-10-28 本人时空胶囊](milestones/2026-10-28-whispers-capsules-r1.md)（[验证清单](validation/2026-10-28-whispers-capsules-r1.json)）

- [2026-10-28 匿名兼容与隐私恢复](milestones/2026-10-28-whispers-privacy-r1.md)（[验证清单](validation/2026-10-28-whispers-privacy-r1.json)）

- [2026-10-28 正式进程与依赖装配](milestones/2026-10-28-whispers-runtime-r1.md)（[验证清单](validation/2026-10-28-whispers-runtime-r1.json)）

- [2026-10-28 B09本地环境与客户端联合验证（部分完成）](milestones/2026-10-28-whispers-b09-integration-r1.md)

- [2026-10-29 用户页直接封禁/解封、禁言/取消禁言（未提交工作区，运行环境待升级）](milestones/2026-10-29-user-restrictions-r1.md)

- [用户直接处置0028迁移、后端重启与真实数据核对](milestones/2026-10-29-user-restrictions-live-r1.md)：本地四操作、权限及审计验证完成；合成用户已解除限制，非生产/真机验收。

- [用户直接处置精确源码提交与停机补充](milestones/2026-10-29-user-restrictions-commit-r1.md)：关联两端完整提交与已固定验证证据；本地管理端、API和worker已关闭。

- [提交检查补充：保留固定原始日志尾空格](milestones/2026-10-29-user-restrictions-commit-r2.md)：全量暂存差异检查唯一例外，其余文件检查通过。

- [资料广场精确提交与服务关闭](milestones/2026-10-29-resource-plaza-commit-stop-r1.md)。
