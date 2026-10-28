# 小程序文档索引

对应工程：`liyuanci-miniprogram-uniapp`。关联 T001–T004、REQ-001、REQ-018、REQ-020；具体业务 REQ 及验收映射以各记录为准。

本目录迁入文件是 2026-10-22 整理时的固定快照，保留历史状态及测试结论；不因归档宣称当前功能验收通过。后续按日期/主题/revision 新增记录，补充与勘误引用原文；只更新本索引入口。参见[统一规范](../../governance/README.md)。

后续源码使用 `develop`，文档使用 `mini-deveop`（用户于2026-10-23指定）。

## 实施与接入说明

- [真实登录、双账号与真机联调操作册](milestones/2026-10-28-real-integration-runbook-r1.md)；环境、阻塞与WI完整矩阵见[三端联调总册](../backend/milestones/2026-10-28-real-integration-runbook-r1.md)，配合[管理端页面步骤](../admin/milestones/2026-10-28-real-integration-runbook-r1.md)。
- 共享输入：[需求基线](../../requirements/baseline.md)、[树洞需求](../../requirements/whispers-v1.md)、[契约导航](../../contracts/navigation.md)、[树洞契约](../../contracts/whispers-v1/README.md)、[进度](../../plans/progress.md)、[阻塞](../../plans/blockers.md)、[联调台账](../../plans/integration-log.md)。

- [后续开发顺序与当前实现范围](development-plan.md)
- [小程序接口核对与已实现功能](api-call-audit.md)
- [小程序认证与发布接入准备](integration-readiness.md)

## 固定阶段记录

- [阶段一：T004 / T009 工程基础与微信会话](milestones/01-T004-T009-foundation-session.md)
- [阶段二：T013 学生认证接入（前端实施中）](milestones/02-T013-verification.md)
- [阶段三：T015 心愿与广场（前端实施中）](milestones/03-T015-wishes.md)

## 后续记录

- [2026-10-22 文档归属与规则治理](milestones/2026-10-22-docs-governance-r1.md)

- [2026-10-23 心愿详情与生命周期接入（未验证、未提交）](milestones/2026-10-23-wish-detail-lifecycle-r1.md)

- [2026-10-23 心愿详情检查修复与提交补充](milestones/2026-10-23-wish-detail-lifecycle-r2.md)

- [2026-10-23 应愿申请、唯一匹配与公开主页接入](milestones/2026-10-23-applications-matching-r1.md)

- [2026-10-23 聊天、站内通知与微信AppID配置](milestones/2026-10-23-chat-notifications-r1.md)

- [2026-10-23 还愿故事、还愿墙与微信分享回流](milestones/2026-10-23-stories-sharing-r1.md)

- [2026-10-23 个人资料、身份标签隐藏与黑名单管理](milestones/2026-10-23-profile-privacy-r1.md)

- [2026-10-23 内容举报、警告阅读确认与处罚申诉](milestones/2026-10-23-reports-warnings-appeals-r1.md)

- [2026-10-26 本人关怀卡与援助资料接入](milestones/2026-10-26-crisis-care-r1.md)

- [2026-10-26 账号注销、处理中与匿名删除回执](milestones/2026-10-26-account-deletion-r1.md)

- [2026-10-26 Tailwind样式统一与亮暗主题（工作区实现）](milestones/2026-10-26-tailwind-theme-r1.md)

- [2026-10-26 页面逻辑回归、问题修复与主题提交](milestones/2026-10-26-page-logic-theme-r1.md)

- [2026-10-26 原始测试日志空白检查说明](milestones/2026-10-26-page-logic-evidence-r1.md)

- [2026-10-27 待后端协调与实现同步清单](milestones/2026-10-27-backend-coordination-r1.md)

- [2026-10-27 独立前端收口：聊天会话、分页与轮询](milestones/2026-10-27-frontend-independent-r1.md)

- [2026-10-27 独立前端收口精确源码提交补充](milestones/2026-10-27-frontend-independent-commit-r1.md)

- [2026-10-27 悄悄鲤小程序端开发计划（规划，未实现）](milestones/2026-10-27-whispers-development-plan-r1.md)

- [2026-10-27 悄悄鲤第一批：契约、会话与黑名单迁移（本端完成，真实联调待交接）](milestones/2026-10-27-whispers-foundation-r1.md)

- [2026-10-28 悄悄鲤第二批：文字树洞、匿名身份、发帖与我的记录（本端完成，真实联调待交接）](milestones/2026-10-28-whispers-text-r1.md)

- [2026-10-28 悄悄鲤第三批：暖评新建与编辑、抱抱和模块通知（本端完成，真实联调待交接）](milestones/2026-10-28-whispers-interactions-r1.md)

- [2026-10-28 悄悄鲤第四批：本人时光胶囊列表、封存、详情与取消删除（本端完成，真实联调待交接）](milestones/2026-10-28-whispers-capsules-r1.md)

- [2026-10-28 E批本地真实客户端联调（真机与完整验收待补）](milestones/2026-10-28-whispers-e-integration-r1.md)
