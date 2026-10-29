# 用户直接处置源码提交与停机补充 r1

日期：2026-10-29（Asia/Shanghai）；关联REQ-022-I/J/K/L、REQ-016、REQ-018、REQ-019；契约user-restrictions/1.0.0、admin-users/1.0.0。用户明确要求关闭两端、先提交两端源码、再补精确提交关联的交付记录并推送；本记录只追加事实，不更改固定历史。

## 精确提交

- 后端 `develop` / `96f3754e02aa2c0c563ea2aa4385f0917e535ac4`，父提交 `ca9f68ac51285dafee88431d7610d9856e394985`，主题“feat(safety): 支持后台直接封禁解封与禁言解除”。14个文件覆盖用户处置状态GET与四POST、独立封禁/禁言、版本与幂等保护、理由加密/审计、直接来源申诉权限、0028上下迁移和回归测试。
- 管理端 `develop` / `305b004ddd9a0d2c6fab16d6a8a23cd932320167`，父提交 `69f07a2af4c84b4da8026c636c7a06463491f548`；[管理端提交补充](../../admin/milestones/2026-10-29-admin-users-commit-r1.md)。两端源码已先于本记录提交，工作区干净。
- docs沿用本跨端任务独立 `admin-develop`，基点 `3412a7549e69bd38125e1a7dd401a743adcbe309`；主工作树backend-develop及在途修改未动。文档与契约作为随后独立docs提交交付；按授权普通推送，不合并其他分支、不强制覆盖远端。

[提交与停机证据](../validation/2026-10-29-user-restrictions-commit-r1.json)保存两个commit/tree/parent、逐文件SHA-256及既有验证快照引用。两端提交内容与前次已验证工作区字节完全相同；本轮没有源码变更、迁移改写或额外业务操作。

## 固定证据关联与验证

| 原记录 | 原SHA-256 | 本次补充 |
| --- | --- | --- |
| [后端实现与隔离测试](2026-10-29-user-restrictions-r1.md) | `e999f9746afcbffc79b009baca398ae4c4d60d4757aee121717dde822145fed9` | 未提交工作区现关联到精确后端提交 |
| [0028与本地真实联调](2026-10-29-user-restrictions-live-r1.md) | `e20898b97f39b03b99bd7a917eb4d0251c56130240ca4db60d5b71d8e095e73c` | 已联调的相同源码已提交；运行状态变为已关闭 |

前次实际执行的make fmt/check/build、显式PostgreSQL集成与race、契约校验，以及后续实际迁移/重建/dev-doctor/真实浏览器和SQL数据核对，均见上述固定证据。本轮按提交树逐文件匹配，不重复跑相同源码检查、不改写测试数量或原结论。本轮执行Git暂存范围/差异检查、进程与端口关闭验证、docs链接与全部固定指纹检查。

## 停机与数据保留

使用既有 `make dev-stop` 停止本地配置所属API PID93670及5个worker（58165、58166、58189、58219、58226）；逐一确认已退出，18080端口关闭。管理端PID93638亦退出，5173关闭。

保留liyuanci-local项目PostgreSQL、独立恢复PostgreSQL、Redis、NameServer/Broker及数据卷，不执行infra-stop、删除或清理。0028继续保留；迁移前私有备份保留在忽略目录，未进入Git。合成目标保留两条已撤销处罚、回执与审计，未回退版本或删除留迹。

新文档/证据与索引、固定清单一并提交；随后普通推送后端develop、管理端develop及docs admin-develop，远端结果交付时核验。生产、小程序实机、外部供应商及备份恢复演练仍不在已完成范围内，AI不签发G1/G2/G3。
