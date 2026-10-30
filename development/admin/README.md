# 管理端文档索引


- [2026-10-29 三端本地真实联调（进行中、未固定/未提交）](../backend/milestones/2026-10-29-local-three-client-integration-r1.md)：本端脱敏证据归档于validation，完整覆盖及未完成项见同轮记录。

对应工程：`liyuanci-admin-vue`。关联 T001–T004、REQ-001、REQ-018、REQ-020；具体业务 REQ 及验收映射以各记录为准。

本目录迁入文件是 2026-10-22 整理时的固定快照，保留历史状态及测试结论；不因归档宣称当前功能验收通过。后续按日期/主题/revision 新增记录，补充与勘误引用原文；只更新本索引入口。参见[统一规范](../../governance/README.md)。

当前开发：管理端源码使用 `develop`，本端文档使用 `admin-develop`；后端在途工作保留于其独立工作区。

## 实施与接入说明

- [资料广场本地真实管理端联调与小程序反馈汇总](milestones/2026-10-29-resource-plaza-live-r1.md)：真实浏览器创建、上下架与分类占用约束通过，反馈总计1/不全1；本地服务保持运行，非真机/生产验收。

- [资料广场管理端1.0.1接入与最终源码补证](milestones/2026-10-29-resource-plaza-implementation-r2.md)：创建隐私重放404清理、758项应用测试/58项规则回归及当前浏览器合成证据；未提交，真实后端联调待执行。

- [资料广场管理端实现与独立验证](milestones/2026-10-29-resource-plaza-implementation-r1.md)：10个后台操作、资料与分类页面、四类反馈汇总、版本/幂等及权限边界；本端检查和合成浏览器回归通过，源码未提交，真实后端联调待执行。

- [资料广场管理端独立工作包](milestones/2026-10-29-resource-plaza-development-r1.md)、[正式契约 resource-plaza/1.0.0](../../contracts/resource-plaza-v1/README.md)、[总交接](../../design/resource-plaza-contract-delivery-v1.md)；10个后台操作、资料/分类管理、先下架再编辑及四类反馈汇总，正式输入已固定，尚未实现。

- [用户管理独立开发工作包（含昵称搜索）](milestones/2026-10-29-admin-users-development-r1.md)、[共享契约 admin-users/1.0.0](../../contracts/admin-users-v1/README.md)、[两端交付与联调矩阵](../../design/admin-users-delivery-v1.md)；设计产物，不代表接口已实现。

- 首期新增：[平台用户管理需求](../../requirements/admin-users-v1.1.md)与[已采纳方案及昵称搜索设计 v1.1](../../design/admin-users-v1.1.md)。范围与推荐方案已采纳，新增昵称模糊搜索；查询协议待评审及正式化，本次尚无实现或联调结论。

- [真实页面联调操作册：账号、角色、页面步骤与通过标准](milestones/2026-10-28-real-integration-runbook-r1.md)；环境与WI完整矩阵见[三端联调总册](../backend/milestones/2026-10-28-real-integration-runbook-r1.md)，配合[小程序操作册](../miniprogram/milestones/2026-10-28-real-integration-runbook-r1.md)。
- 共享输入：[需求基线](../../requirements/baseline.md)、[树洞需求](../../requirements/whispers-v1.md)、[契约导航](../../contracts/navigation.md)、[树洞契约](../../contracts/whispers-v1/README.md)、[进度](../../plans/progress.md)、[阻塞](../../plans/blockers.md)、[联调台账](../../plans/integration-log.md)。

- [T012 身份审核页接入清单](T012-integration.md)
- [T010 契约接入疑问](contract-questions.md)
- [T004 Web / T010 首批交付记录](delivery-T004-T010.md)

## 固定阶段记录

- [T004](milestones/T004.md)
- [T010](milestones/T010.md)
- [T012](milestones/T012.md)
- [T017 词库契约 0.2.0 迁移](milestones/T017-wordlists-v0.2.0.md)
- [T017 内容审核与词库管理](milestones/T017.md)
- [后台账号管理](milestones/admin-accounts.md)
- [B07 revision 1 管理端适用消费核对](milestones/admin-actions-r1.md)
- [T010/T012/T017 管理端契约 0.2.0 收口](milestones/admin-contract-v0.2.0.md)
- [T010 / INT-003 后台局部联调准备](milestones/admin-int003.md)
- [最新 API 核对与功能清单](milestones/api-audit-r5.md)
- [开发规范自动检查](milestones/development-standards.md)
- [默认开放真实后台接口](milestones/real-admin-api.md)

## 验证证据

- [T017 验证快照 / Validation snapshots](validation/T017-2026-10-21.md)
- [T017 词库迁移验证 / Wordlist migration validation](validation/T017-wordlists-v0.2.0.md)
- [管理端 0.2.0 验证快照 / Admin migration validation](validation/admin-contract-v0.2.0.md)
- [INT-003 本端验证快照 / Local validation snapshot](validation/admin-int003.md)

## 后续记录

- [2026-10-22 文档归属与规则治理](milestones/2026-10-22-docs-governance-r1.md)

- [2026-10-23 身份审核真实接口核对与功能验证](milestones/2026-10-23-identity-integration-r1.md)

- [2026-10-23 内容审核及词库真实接线、移除运行时演示（未验证）](milestones/2026-10-23-content-api-only-r1.md)

- [2026-10-23 审核结果枚举差异（待后端契约协调）](milestones/2026-10-23-moderation-outcome-gap-r1.md)

- [2026-10-23 举报、处罚与申诉管理真实接入（未验证）](milestones/2026-10-23-safety-management-r1.md)
- [2026-10-23 管理端按模块提交精确关联补充](milestones/2026-10-23-module-commits-r1.md)

- [2026-10-23 危机工作台真实接入与测试交付](milestones/2026-10-23-crisis-workspace-r1.md)

- [T032 后台证据删除、回执管理及危机服务启用补证据](milestones/2026-10-23-evidence-deletion-r1.md)

- [T032 隐私路由启用后真实接口联调及查询反馈修复](milestones/2026-10-23-evidence-deletion-r2.md)

- [2026-10-23 统一布局、面包屑及深浅色主题基础](milestones/2026-10-23-navigation-theme-r1.md)

- [账号查询与抽屉编辑分离 r1](milestones/2026-10-23-accounts-editor-r1.md)

- [词单列表、详情与草稿拆页 r1](milestones/2026-10-23-wordlists-pages-r1.md)

- [举报、处罚与申诉独立页面及处理抽屉](milestones/2026-10-23-safety-pages-r1.md)

- [身份审核查询详情与处理分离](milestones/2026-10-23-identity-separation-r1.md)

- [内容审核查询详情与处理分离](milestones/2026-10-23-moderation-separation-r1.md)

- [危机查询详情与处理抽屉分离](milestones/2026-10-23-crisis-separation-r1.md)

- [证据删除处理与回执查询独立页面](milestones/2026-10-23-privacy-pages-r1.md)

- [全站回归与公共边界修复](milestones/2026-10-23-site-regression-r1.md)

## 悄悄话首期开发

- [管理端开发计划](whispers-development-plan.md)

- [2026-10-27 悄悄话 WA-01 类型、服务与验证](milestones/2026-10-27-whispers-wa01-r1.md)

- [WA-01 类型数量勘误](milestones/2026-10-27-whispers-wa01-errata-r1.md)

- [WA-01 源码提交精确关联](milestones/2026-10-27-whispers-wa01-commit-r1.md)

- [2026-10-27 树洞审核页面与提交记录](milestones/2026-10-27-whispers-wa02-r1.md)

- [2026-10-27 树洞举报治理与申诉适配](milestones/2026-10-27-whispers-wa03-r1.md)

- [2026-10-27 树洞危机与限定证据治理](milestones/2026-10-27-whispers-wa04-r1.md)

- [2026-10-28 树洞回归与交接准备（真实联调阻塞）](milestones/2026-10-28-whispers-wa05-r1.md)

- [2026-10-28 WA-05真实HTTP子范围及阻塞更新 r2（整体未关闭）](milestones/2026-10-28-whispers-wa05-r2.md)

- [2026-10-29 平台用户管理 UM-A01–A06 本端实现与合成验证（未提交工作区，真实联调待执行）](milestones/2026-10-29-admin-users-implementation-r1.md)

- [2026-10-29 用户页直接封禁/解封、禁言/取消禁言（未提交工作区，运行环境待升级）](milestones/2026-10-29-user-restrictions-r1.md)

- [用户直接处置本地真实浏览器联调](milestones/2026-10-29-user-restrictions-live-r1.md)：本地四操作、权限及审计验证完成；合成用户已解除限制，非生产/真机验收。

- [平台用户管理精确源码提交与关闭环境补充](milestones/2026-10-29-admin-users-commit-r1.md)：关联两端完整提交与已固定验证证据；本地管理端、API和worker已关闭。

- [提交检查补充：保留固定原始日志尾空格](../backend/milestones/2026-10-29-user-restrictions-commit-r2.md)：全量暂存差异检查唯一例外，其余文件检查通过。

- [资料广场精确提交与服务关闭](milestones/2026-10-29-resource-plaza-commit-stop-r1.md)。
