# 宿主开发与配置整理提交补充记录 r1

日期：2026-10-22（Asia/Shanghai）。用户明确授权将本次改动分别提交后端和docs，先提交后端，再新增补充记录关联精确源码提交，推送并合并。工程追踪REQ-018/020，不新增业务REQ，不改变G1/G2/G3或契约0.2.0、B07 revision 5。

## 精确源码关联

- 源码仓库：`calm195/liyuanci-backend-go`。
- 开发分支：`codex/host-development`。
- 已完成源码提交：`72c7d49f82ac3e3c028ae0f7632f903e91e7add1`。
- Conventional Commit：`feat(dev): streamline host development and local configuration`。
- 源码父提交：`c21c727dfc8750dcc878a95084a4dcb3b2e47eb1`。
- docs基点：`45e6344dd09f36b4301a9ddd6ef829c11052f6bc`，docs使用同名分支。
- 后端先提交，随后才形成此补充记录；源码提交后工作区干净，提交不含.local凭据、对象、运行状态或清理清单。

本记录形成时后端提交已完成，docs提交、分支推送和main快进合并随后执行；远端完成状态以实际Git refs与最终交付回报为准。此补充不增加部署或上线操作。

## 关联的固定交付

本次源码提交覆盖[宿主开发方式](2026-10-22-host-development-r1.md)、[原生PG/Redis方式](2026-10-22-native-middleware-r1.md)及[目录、配置与资源清理](2026-10-22-dev-layout-r1.md)的最终实现。后续用户调整以最后一份目录整理记录为当前行为：凭据在.local忽略目录，公共配置分类，Compose集中，专项验收脚本删除，CI保留常规质量检查和Make集成。

上述记录形成时尚未提交，其“未提交工作区”文字保持历史事实，不修改固定内容。原记录指纹与本次提交树、关联验证清单指纹见[补充证据](../validation/2026-10-22-host-development-commit-r1.json)。

## 验证与边界

对源码提交中的全部验收文件逐项读取Git对象并校验SHA-256，与[最终目录整理验证清单](../validation/2026-10-22-dev-layout-r1.json)的after_worktree_files_sha256一致。提交前已审查88个暂存文件范围、空白检查及.local排除。

源码未新增变化，复用前轮真实执行通过的make fmt/check/build、29项离线单测、原生/宿主开发、Make中间件往返、完整启停、监控/指标及合成Webhook验证结果；本轮不把复用结果描述为重跑。docs提交前执行文档链接、固定指纹和暂存空白检查。

本记录仅补全提交关联及发布顺序，不改变已有外部供应商、整体readyz503、生产未验收等边界；不重新运行资源删除，不推送凭据，不改变普通stop保留卷的行为。
