# 后端文档索引

对应工程：`liyuanci-backend-go`。关联 T001–T004、REQ-001、REQ-018、REQ-020；具体业务 REQ 及验收映射以各记录为准。

本目录迁入文件是 2026-10-22 整理时的固定快照，保留历史状态及测试结论；不因归档宣称当前功能验收通过。后续按日期/主题/revision 新增记录，补充与勘误引用原文；只更新本索引入口。参见[统一规范](../../governance/README.md)。

## 实施与接入说明

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
