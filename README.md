# 鲤源池文档工程

本工程集中管理三个开发工程的需求、设计、契约、开发过程、阶段交付和验证证据。开发工程只保留运行/开发必需的 README、AGENTS 及源码旁用法说明。

## 按端入口

- [后端文档](development/backend/README.md)
- [管理端文档](development/admin/README.md)
- [小程序文档](development/miniprogram/README.md)
- [文档管理规范与分支流程](governance/README.md)
- [迁移清单](governance/migration-2026-10-22.json)与[固定文件清单](governance/frozen.json)

## 共享材料

| 类别 | 入口 |
| --- | --- |
| 原始输入 / 基线 / 问题 | [原始输入（只读）](requirements/original.md)、[基线](requirements/baseline.md)、[问题](requirements/questions.md) |
| 用户批准 | [审批说明](approvals/README.md)、[G1](approvals/G1.md)、[G2](approvals/G2.md)、[G3](approvals/G3.md) |
| 架构与设计 | [方案比较](design/options.md)、[架构](design/architecture.md)、[决策](design/decisions.md) |
| 接口 | [契约导航](contracts/navigation.md) |
| 实施与进度 | [固定实施计划](plans/implementation-plan.md)、[滚动计划](plans/next-development-integration-plan.md)、[进度](plans/progress.md)、[阻塞](plans/blockers.md)、[联调](plans/integration-log.md) |
| 首期平台用户管理 | [需求增量 v1.1（范围已确认）](requirements/admin-users-v1.1.md)、[已采纳方案及昵称搜索设计 v1.1](design/admin-users-v1.1.md)；[独立开发交付](design/admin-users-delivery-v1.md)、[共享契约](contracts/admin-users-v1/README.md)；查询现存小程序用户、按昵称模糊搜索，复用案件处罚及申诉解罚 |
| 悄悄鲤首期 | [范围授权](approvals/2026-10-27-whispers-scope.md)、[需求增量](requirements/whispers-v1.md)、[开发计划](plans/whispers-development-plan.md)、[详细方案与三端工作包](design/whispers-v1/README.md)、[独立接口契约](contracts/whispers-v1/README.md) |
| 资料广场首期 | [已采纳需求 v1.1（REQ-023）](requirements/resource-plaza-v1.1.md)、[三端方案](design/resource-plaza-v1/README.md)、[正式契约 1.0.0](contracts/resource-plaza-v1/README.md)、[创建隐私重放勘误 1.0.1](contracts/resource-plaza-v1-r2/README.md)、[三端独立工作包与交接](design/resource-plaza-contract-delivery-v1.md)；15接口固定为开发输入；实现与验证见三端各自开发分支的最新记录；四类反馈及固定二维码投稿 |
| 协作与评审 | [协作指令](plans/collaboration-instructions.md)、[需求评审](reviews/requirements-review.md)、[架构评审](reviews/architecture-review.md) |

## 工作方式

主仓库、docs 与三端源码仓库的本地和远程仅保留 `develop`、`main`。任一开发工程变动时同步准备 docs 的 `develop`，过程材料写入本工程对应端目录；经授权合入 `main` 并推送。固定阶段产物不再修改；后续补充、勘误与新交付另建文件。先读 [AGENTS.md](AGENTS.md) 与 [规范](governance/README.md)。本次文档整理不改变需求、人工审批和业务实现权限。

`prompts/01-audit.md` 至 `06-plan.md` 保留为需求与架构流程入口；历史文件的“待批准”等文字按形成时状态解读，实际批准以 approvals/ 对应记录为准。评审会话只写 reviews/；原始输入只读。

```sh
python3 scripts/check_documents.py
python3 scripts/check_gate.py G1
python3 scripts/check_gate.py G2
python3 scripts/check_gate.py G3
```

文件检查不能代替用户批准、独立评审、真实联调或业务验收。
