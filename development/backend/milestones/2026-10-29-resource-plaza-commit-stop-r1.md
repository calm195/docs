# 资料广场提交与本地服务关闭补充 r1

日期：2026-10-29（Asia/Shanghai）。关联 REQ-023、REQ-018、REQ-020。用户明确要求“关闭服务，提交并推送”。

源码分支 `develop`，本次实现提交 `72f926f96227c766047c4ea9251fef3736704634`，仓库 `liyuanci-backend-go`。docs 分支 `backend-develop`，提交前基点 `83945210cb5f9882f4ab3d142a6c004cfacf5fd9`。本补充关联既有[实现记录](2026-10-29-resource-plaza-implementation-r1.md)及[真实本地联调记录](2026-10-29-resource-plaza-local-start-r1.md)，保留原固定记录的字节与历史未提交状态。

本次提交前逐文件比对已验证源码清单，指纹全部一致，暂存范围与清单完全相同；源码差异检查通过，没有新增业务代码，因此复用原完整检查、构建及本地真实联调证据。契约为 `resource-plaza/1.0.1`，manifest SHA-256 `e577c9706f2ab90f000ca26a556ffb0e6c9c5cf9c9ead0dfe2a086e1c6c2489f`；小程序既有1.0.0学生接口与1.0.1一致。

本轮关闭管理端Vite、小程序开发watch、后端API与配套worker及本次liyuanci-local中间件，保留业务数据、联调资料、账号、凭据、备份和Docker数据卷。停止不改变数据库已应用的0029迁移，宿主原生PG/Redis不受影响。微信开发工具窗口可以保留，但不再有本轮构建watch或后端服务。

按用户授权推送各仓库 `origin/develop` 和对应docs分支；共享契约修订另随docs主分支提交。未执行主分支合并或生产部署。真实三端本轮场景已见联调记录，手机真机、正式投稿二维码、真实网盘下载与生产验收仍待完成。本次文档交付执行 `python3 scripts/check_documents.py` 和 `git diff --check`。
