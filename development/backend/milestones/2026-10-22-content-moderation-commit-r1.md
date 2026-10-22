# 内容扫描与人工复核核心精确源码提交补充记录 r1

日期：2026-10-22（Asia/Shanghai）。用户明确授权分别提交后端和docs，先提交后端，再新增docs补充记录关联精确源码提交，最后推送并合并到main。关联T016、REQ-008、REQ-015、REQ-017、REQ-018、REQ-019；不改变需求、审批及契约语义。

## 精确源码关联

- 源码仓库：`calm195/liyuanci-backend-go`。
- 源码与docs开发分支：`codex/content-moderation`。
- 源码完整提交：`a953d17e4d21c9d72836ddffdba8f3e2b70c93a6`。
- Conventional Commit：`feat(moderation): implement content review core`。
- 源码父提交：`61d39d388592ec23ac80acf1248f7f55c30598a2`。
- docs本轮工作区基点：`8cb04420a3960862595edab3fcf91dabc410e178`；源码父提交与阶段记录基点一致：`61d39d388592ec23ac80acf1248f7f55c30598a2`。
- 提交前核对33项源码暂存文件，无无关修改；提交后工作区干净。源码Git提交对象逐文件SHA-256与原冻结验证清单完全一致，详见[提交核对证据](../validation/2026-10-22-content-moderation-commit-r1.json)。

本补充形成时后端提交已完成，docs提交、两仓库主题分支推送及main快进合并随后执行；远端结果以Git实际refs及最终交付回报为准。授权不扩展为部署、上线或资源删除。

## 关联固定记录与证据

本提交覆盖[内容扫描与人工复核核心阶段记录](2026-10-22-content-moderation-r1.md)及其[验证清单](../validation/2026-10-22-content-moderation-r1.json)和[集成摘录](../validation/2026-10-22-content-moderation-integration.txt)。原阶段记录的“未提交工作区”保持当时事实，本补充只关联精确源码提交，不修改原文件或固定指纹。

- 原阶段SHA-256：`69bcf2aa811745fa5925719300bdd92225749198d4d8f9bd0bb8115670d4476f`。
- 原验证清单SHA-256：`54b86d9f937495b004078d1e8394fd83fbaad4f32dd6ef0c12eb7236acb4e711`。
- Git提交对象中33项源码文件SHA-256全部匹配原验证清单；没有引入阶段记录之外的源码变更。
- 用户确认保留正式B05契约0.2.0并以精确`content_registry.id`为逐版本处置对象；本轮不激活扩展草案或内容处置接口。正式输入及用户决定均沿用原阶段证据。

## 验证、范围与边界

源码没有在提交前的最终验证后新增修改；复用阶段记录已列明的`make fmt`、`make check`、`make build`、31项脚本单测、针对性真实PG/MQ用例及最终`make integration`结果，不把复用结果描述为本轮重跑。两仓库提交前的源码/文档范围、完整基点、冻结文件指纹及暂存差异均已核对，docs文档链接与固定指纹检查通过。

本次只固定提交关联，不新增业务行为。真实规则和扫描供应商、常驻内容worker、领域接入、完整危机事件与生产验收仍按原阶段记录标记为未完成；没有启停用户业务资源。
