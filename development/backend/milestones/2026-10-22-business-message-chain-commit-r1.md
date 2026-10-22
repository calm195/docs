# 业务消息链路精确源码提交补充记录 r1

日期：2026-10-22（Asia/Shanghai）。用户明确授权分别提交后端和docs，先提交后端，再新增docs补充记录关联精确源码提交，最后推送并合并到main。关联T007、REQ-006、REQ-007、REQ-015、REQ-017、REQ-018、REQ-019、REQ-020；不改变需求、审批及契约语义。

## 精确源码关联

- 源码仓库：`calm195/liyuanci-backend-go`。
- 源码与docs开发分支：`codex/business-message-chain`。
- 已完成源码提交：`61d39d388592ec23ac80acf1248f7f55c30598a2`。
- Conventional Commit：`feat(worker): connect durable business message processing`。
- 源码父提交：`72c7d49f82ac3e3c028ae0f7632f903e91e7add1`。
- docs完整基点：`87028d13237018c4eb054c930afa30b32c712cba`。
- 已检查18项源码暂存文件，无无关修改及.local凭据、对象或本机状态。源码提交后工作区干净。

本补充形成时后端提交已完成，docs提交、两仓库主题分支推送及main快进合并随后执行；远端结果以Git实际refs及最终交付回报为准。授权不扩展为部署、上线或资源删除。

## 关联固定记录与证据

本提交覆盖[业务消息链路收口记录](2026-10-22-business-message-chain-r1.md)与其[验证清单](../validation/2026-10-22-business-message-chain-r1.json)。原记录的“未提交工作区”保持当时事实，本补充只关联精确提交，不改原记录或固定指纹。

- 原阶段SHA-256：`3398a25b3f14bcbc1b24a44909c3f035882344ebaafd55f0568a78bfa30cf9f2`。
- 原验证清单SHA-256：`b46d6facb90f0f457a74c2194f7f995c16cadfaa79da1620b176952169aedd30`。
- 逐项读取源码提交Git对象计算SHA-256，18项全部匹配原验证清单；详见[提交核对证据](../validation/2026-10-22-business-message-chain-commit-r1.json)。
- 共享契约0.2.0、B07静态动作索引revision 5保持；未修改批准输入、契约、共享进度或阻塞台账。

## 验证、范围与边界

源码没有新增修改，复用前轮实际通过的make fmt/check/build、29项脚本单测、make integration及同库业务测试复跑。真实PG/Redis/MQ学生卡链和受限worker启动/TERM退出已验证，图片安全、身份交换、密钥及对象仍是明确合成夹具；不把复用结果描述为本轮重跑。

本轮实际核对两仓库分支/完整HEAD/工作区、抓取远端、暂存范围、Git对象文件指纹及空白检查；提交前运行docs文档链接与固定指纹检查。已确认远端main为本次开发基点的祖先，采用快进合并，不改写历史，不使用强制推送。

未新增对外管理HTTP/UI、未来领域取消/隐私矩阵或生产能力；生产ACL、消息保留/死信运维、真实外部供应商、跨端、性能及全副本恢复仍未验收。原测试项目卷和凭据按前轮约定保留，本轮没有启停服务或重跑资源清理。
