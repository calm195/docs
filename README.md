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
| 悄悄鲤首期 | [范围授权](approvals/2026-10-27-whispers-scope.md)、[需求增量](requirements/whispers-v1.md)、[开发计划](plans/whispers-development-plan.md)、[详细方案与三端工作包](design/whispers-v1/README.md)、[独立接口契约](contracts/whispers-v1/README.md) |
| 协作与评审 | [协作指令](plans/collaboration-instructions.md)、[需求评审](reviews/requirements-review.md)、[架构评审](reviews/architecture-review.md) |

## 工作方式

任一开发工程变动时同步准备同名 docs 分支，过程材料写入本工程对应端目录。固定阶段产物不再修改；后续补充、勘误与新交付另建文件。先读 [AGENTS.md](AGENTS.md) 与 [规范](governance/README.md)。本次文档整理不改变需求、人工审批和业务实现权限。

`prompts/01-audit.md` 至 `06-plan.md` 保留为需求与架构流程入口；历史文件的“待批准”等文字按形成时状态解读，实际批准以 approvals/ 对应记录为准。评审会话只写 reviews/；原始输入只读。

```sh
python3 scripts/check_documents.py
python3 scripts/check_gate.py G1
python3 scripts/check_gate.py G2
python3 scripts/check_gate.py G3
```

文件检查不能代替用户批准、独立评审、真实联调或业务验收。
