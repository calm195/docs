# 资料广场本地环境启动与联调 r1

日期：2026-10-29（Asia/Shanghai）。关联 REQ-023、REQ-002、REQ-016、REQ-018、REQ-020。用户要求“启动本地环境联调”，本轮启动既有开发环境并验证真实 HTTP，不提交、推送或部署生产环境。

## 基点与输入

- 后端源码：`develop`，HEAD `96f3754e02aa2c0c563ea2aa4385f0917e535ac4`。保留上一轮未提交的资料广场实现；本轮没有修改业务源码，28项源码指纹仍与[实现证据](../validation/2026-10-29-resource-plaza-implementation-r1/result.json)一致。
- docs：`backend-develop`，HEAD `83945210cb5f9882f4ab3d142a6c004cfacf5fd9`，工作树 `/private/tmp/liyuanci-rp-docs-backend`。本记录及证据为新增未提交产物，原固定记录保持原样。
- 正式输入：[resource-plaza/1.0.1](../../../contracts/resource-plaza-v1-r2/README.md)，manifest SHA-256 `e577c9706f2ab90f000ca26a556ffb0e6c9c5cf9c9ead0dfe2a086e1c6c2489f`；需求与契约均未变更。

## 本地环境与迁移

沿用 `.local/local/operations.env` 的 `liyuanci-local` Docker 项目、原后台账号和既有本地单 DSN 业务模式。启动 OrbStack 后，以 `make dev-infra DEV_ARGS=--mq` 恢复本项目 PostgreSQL、独立恢复 PostgreSQL、Redis、RocketMQ NameServer/Broker，五个容器均 healthy。未操作其他项目，也未清理数据卷；宿主原生 PG/Redis 保持原状。

现有业务库迁移版本为28。先通过 `pg_dump -Fc` 备份到忽略目录 `.local/local/resource-start-20261029/before-resource-migration.dump`（权限0600），再以原专用迁移身份执行 `go run ./cmd/migrate up`，以本地数据库管理员执行 `go run ./cmd/migrate permissions`，均退出0，版本升至29。普通 API 启动没有执行 DDL。操作前后核对业务配置、简化业务配置、迁移凭据、树洞配置、后台登录文件及 operations.env，六项指纹全部保持不变，没有重置账号或替换密钥。

`make dev-doctor` 实际连接数据库、Redis并检查完整业务装配，通过。第一次在受限工具环境运行时本机资源连接失败；使用获准的本地执行权限复跑后通过，未为规避连接限制降低应用校验。

## 常驻进程与入口

以下进程经既有 `scripts/dev.py` 标准入口启动，日志保存在源码忽略目录 `.local/local/resource-start-20261029/`，PID/锁继续由原入口管理：

| 入口 | 进程与作用 |
| --- | --- |
| `make dev-api` | server，监听 `127.0.0.1:18080` |
| `make dev-worker` | card-worker，沿用既有学生卡开发适配与 MQ 配置 |
| `make dev-content-worker` | content-worker，沿用既有人工审核模式与 MQ 配置 |
| `make dev-whispers-worker` | whisper-content-worker，沿用数据库轮询 |
| `make dev-privacy-worker` | privacy-account-worker，本地账户清理 |
| `make dev-evidence-worker` | privacy-evidence-worker，本地证据清理 |

管理端 `http://127.0.0.1:5173/` 使用既有 Vite 同源代理连接18080；后台登录凭据继续从 `.local/local/admin-login.txt` 读取，口令和会话令牌不进入文档。小程序已用 `VITE_USE_MOCK=false`、`http://127.0.0.1:18080/api/v1` 启动开发 watch，产物为 `liyuanci-miniprogram-uniapp/dist/dev/mp-weixin`，已在微信开发者工具打开。

停止后端使用 `make dev-stop`，保留中间件和卷；需要停止本项目中间件时显式使用 `make dev-infra-stop`。不要关闭宿主原生 PG/Redis或按进程名全局终止应用。

## 实际验证与边界

[脱敏启动证据](../validation/2026-10-29-resource-plaza-local-start-r1.json)记录迁移、配置保持、进程和 HTTP 结果。六进程存活，启动日志没有 error/fatal/panic。`/healthz`、`/readyz` 均200；未登录访问学生资料、学生分类、后台资料、后台分类均401，响应含 `Cache-Control: no-store` 及请求ID。

管理端浏览器通过实际 Vite → Go API → PostgreSQL 完成管理员登录、分类创建、资料草稿创建、显式上架、下架编辑、保存后仍下架、再次上架及模糊搜索；已引用分类停用返回409并正确解释。没有拦截或替换 HTTP 响应。联调资料 `624595a5-aab4-4349-90fe-d3f2e2000a90` 保留上架，资料版本5、内容版本2；其外部下载地址为明确合成样例，没有执行真实网盘下载。管理端详细证据由 `admin-develop` 本轮独立记录提供。

用户随后明确授权“本次微信登录验证”。微信开发者工具模拟器使用现有账号完成真实微信登录，既有认证状态为已认证，没有修改账号资格。小程序实际完成分类与简介关键词联合搜索、资料详情、两个复制按钮分别请求最新 `download-info?expected_version=5`（200）并提示复制成功；四类反馈依次切换均PUT200，最终为“不全”。管理端随后刷新真实列表和详情，确认内容版本2、总计1、不全1、其余三类0，完成反馈跨端闭环；没有页面错误。投稿弹窗显示固定引导语及“投稿二维码暂未配置”。小程序详细证据由 `mini-deveop` 本轮独立记录提供。该过程未使用合成API响应或临时伪造学生令牌。

本地数据库、Redis、MQ、HTTP及本次微信登录为真实依赖；单 DSN、人工审核、学生卡扫描及部分外部清理继续使用既有开发适配。`readyz` 200不表示真实外部供应商或生产验收通过。微信开发者工具模拟器不等同于手机真机，正式投稿二维码仍未提供，真实二维码识别与网盘下载可用性未验证。

本轮没有修改源码，未重复已经通过的全量 Go 检查与构建；启动入口重新编译实际运行的后端制品。交付前运行 `python3 scripts/check_documents.py` 和 `git diff --check`。本次只完成本地开发环境启动与记录所列操作，不签发人工验收。
