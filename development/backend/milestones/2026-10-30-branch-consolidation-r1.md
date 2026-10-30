# 后端分支统一与文档汇总 r1

日期：2026-10-30（Asia/Shanghai）。关联 T004、REQ-018、REQ-020，仅记录仓库协作治理，不新增业务需求或验收结论。

用户明确要求将 `docs-admin-develop` 内容汇入 docs、合入 main 并推送，删除该目录，各端仅保留 develop 和 main，并更新主仓库。

## 提交与范围

- 源码仓库：`liyuanci-backend-go`；开发分支 `develop`，提交 `fd4af3138a7a05de7e0cc54a593665c0d577a823`，已快进合入本地 `main`。
- 源码基点：`4877b6ba968d1915a995a79ba854e5daea4ab2a9`；本次只修改根 AGENTS 与 README 中的协作约定，业务源码、依赖、配置及接口语义不变。
- docs 分支：`develop`；本次治理记录基点 `1ef94b1eb8fb2d6e21571a0e1986bc2155ee5a01`，已汇总原 admin-develop、backend-develop、mini-deveop 的文档提交；三端历史记录的原分支名保留为当时快照。
- 契约版本：沿用现有契约，本次未修订；资料广场 `resource-plaza/1.0.1` 及其 `1.0.0` 基线静态校验通过。

## 分支与内容保全

源码与 docs 统一在各自 `develop` 开发，按授权合入 `main` 并推送；主仓库及四个子模块的本地和远程仅保留这两个分支。并行写入须协调，必要时使用 detached 工作树并在汇总后清理。删除旧分支以前验证所有旧分支 tip 均为保留分支的祖先；删除工作树以前检查已跟踪、未跟踪与忽略文件均无未保存内容。远程推送与删除结果以本次执行结束时的远程引用核对为准。

文档合并仅对索引条目与固定清单取并集，既有815个固定文件的字节及SHA-256均保留；不修改既有审批、契约与测试日志。源码先提交，再记录精确提交并提交docs，最后更新主仓库子模块指针。

## 本次实际验证

- `make fmt`：通过。
- `make check（格式、go vet、go test -race -cover ./...）`：通过。
- `git diff --check` 与提交前暂存差异检查：通过。
- 汇总后的 `python3 scripts/check_documents.py --same-branch`：通过，815个既有固定文件、75个迁移来源、6个历史链接映射均有效（新增本记录前，四仓库位于develop）。
- 资料广场契约校验使用已有隔离Python环境通过；系统Python缺少jsonschema，未修改业务仓库依赖。

本次为文档与Git整理，未重新执行真实HTTP、微信设备、外部供应商或生产验收；历史局部联调证据保留原有边界。应用运行与部署状态不由分支合并推断。
