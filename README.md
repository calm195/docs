# Codex CLI 半自动需求与架构工作台

## 快速开始
1. 将自己的 Markdown 需求复制到 `requirements/original.md`（保留原件）。
2. 在项目目录运行 `git init`（如未初始化），再运行 `codex`。
3. 在 Codex 中输入：`请按 prompts/01-audit.md 执行，先不要写代码。`
4. 回答 questions.md 中的阻塞问题，然后运行：`请按 prompts/02-baseline.md 执行。`
5. 在另一个终端运行 `codex`，要求：`请按 prompts/04-requirements-review.md 执行。` 评审结束后回到主会话修复。
6. 人工确认 G1，填写 `approvals/G1.md`；运行 `请按 prompts/03-design.md 执行。`
7. 人工确认 G2，填写 `approvals/G2.md`；再次运行设计提示词生成详细设计。
8. 独立终端执行 `prompts/05-architecture-review.md`，主会话修复并复审。
9. 人工确认 G3，填写 `approvals/G3.md`；运行 `prompts/06-plan.md`。
10. 每个关卡执行 `python3 scripts/check_gate.py G1` / `G2` / `G3` 做基础文件检查。

## 注意
- 这是人工审批 + 独立 CLI 会话的半自动流程，不是假定 CLI 自动创建五个 Agent。
- 评审会话建议在不同 Git worktree/分支运行，避免同时修改同一文件；评审报告通过 commit/cherry-pick 合入。
- `check_gate.py` 仅检查文件与显式批准字样，不能代替人工评审。
- 对全新项目：先在 Codex 中访谈并将初步想法写成 `original.md`，然后进入相同流程。
