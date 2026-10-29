# 后台用户查询提交与本地启动补充 r1

日期：2026-10-29（Asia/Shanghai）。任务 UM-02，关联 REQ-022、REQ-016、REQ-018、REQ-019、REQ-021；本地启动沿用 REQ-018/020 工程范围。用户明确授权提交本次后端与文档变更，并启动后端供管理端开发调试。本记录补充精确实现提交与实际启动证据，不更改既有需求、契约或验收结论。

## 1. 精确提交与历史关联

- 源码分支：`develop`；实现提交：`ca9f68ac51285dafee88431d7610d9856e394985`，主题 `feat(admin): 实现后台用户查询与处罚历史`。
- 源码父提交：`5d6fcd614edb8e048677d8bc9813a790b632f0ac`。提交前逐项核对 19 个变更文件的 SHA-256，全部与已验证清单一致；暂存范围仅含这 19 项。提交后源码工作区干净，本轮启动没有再修改源码。
- docs 分支：`backend-develop`；本次文档提交基点：`3412a7549e69bd38125e1a7dd401a743adcbe309`。先完成源码提交，再编写本记录；文档提交包含上一阶段尚未提交的实现记录、验证证据、本补充记录、端内索引及固定清单追加项。
- 契约：`admin-users/1.0.0`；manifest SHA-256 `c0ea73add47bedc8b934ccdc23500bbc4c63c704ecc974b4f5e75e864478b48f`。全站 0.2.1、树洞 1.0.0 与原动作契约保持原样。
- 原[实现记录](2026-10-29-admin-users-implementation-r1.md) SHA-256：`ae8240ec9651b312cec8225b6c6f0e43e3f0da9c8088f364353c64db2363dc48`。
- 原[验证清单](../validation/2026-10-29-admin-users-implementation-r1.json) SHA-256：`3e09b2acad3d062d42daba88f9b014b11ec9a38ff407f4875bca3506a8eca5d9`。

上述原记录已经固定，其中“工作区未提交”是上一阶段的历史事实，原字节和指纹均保留。本记录将其 19 项源码指纹关联到实际提交，不回写历史状态。[本轮脱敏证据](../validation/2026-10-29-admin-users-commit-start-r1.json)记录核对、迁移与 HTTP 结果。

## 2. 实现与规定检查

实现范围沿用原记录：用户列表、用户详情、处罚历史三个 GET 入口；字面昵称搜索、筛选及加密键集游标；账号版本与受权导航；处罚与危机来源可见性；注销和审计兼容；新增 0027 窄权限学生会话布尔函数。未修改原处罚、申诉等写契约。

提交时核对源码指纹完全一致，复用上一阶段实际通过的 `make fmt`、`make check`（全量 vet、race、coverage）、`make build`（9 个进程）、入口脚本 36 项单测、`make integration` 以及契约构建/校验结果。完整输出链接由原实现记录提供；本轮没有新增源码，未重复运行全量 Go/中间件验收。

本轮新增验证：提交范围与指纹核对通过；源码 `git diff --check` 通过；显式迁移 `up` 和 `permissions` 均退出 0；`make dev-doctor` 退出 0，业务身份/结构、Redis、共享对象及本地测试依赖诊断通过。文档 `python3 scripts/check_documents.py` 与 docs `git diff --check` 预检均通过，核验了既有 536 个固定文件、75 个来源映射和链接；追加本记录与证据指纹后，交付前再次执行同一校验。

## 3. 本地启动事实

复用项目 `liyuanci-local` 的既有 Docker PostgreSQL、独立恢复 PostgreSQL、Redis、RocketMQ NameServer/Broker，启动前均 healthy。API 端口 18080 空闲，所选配置没有已运行应用的 PID 登记。没有重新初始化业务环境、生成替代密钥、重置管理员或删除数据卷。

使用 `.local/local/business-migration.json` 的原迁移身份显式执行 `go run ./cmd/migrate up`，业务库版本由 26 升到 27；随后使用本地数据库管理身份显式执行 `go run ./cmd/migrate permissions`。实测 `liyuanci_admin_api` 可执行 `public.is_live_student_session(bytea)`，普通 `liyuanci_api` 无执行权。应用正常启动入口没有隐式 DDL。

沿用 `.local/local/operations.env` 已启用的本地单 DSN 业务模式、人工审核适配与树洞数据库轮询。依次以标准入口启动并保持以下进程运行：

| 入口 | 宿主进程 |
| --- | --- |
| `make dev-api` | server，监听 `127.0.0.1:18080` |
| `make dev-worker` | card-worker |
| `make dev-content-worker` | content-worker |
| `make dev-whispers-worker` | whisper-content-worker |
| `make dev-privacy-worker` | privacy-account-worker |
| `make dev-evidence-worker` | privacy-evidence-worker |

启动器后台运行，日志保存在源码忽略目录 `.local/local/admin-users-start-20261029/`，各进程按原入口写 PID/锁。初次检查及 HTTP 冒烟后 6 个进程均存活，所采集结构化启动日志无 error/fatal/panic。配置、业务文件、迁移文件、树洞配置、数据库口令及后台登录文件共 7 项指纹均未改变；派生宿主配置由原入口正常刷新。

管理端现有 Vite 配置已将同源 `/api/v1` 代理至 `http://localhost:18080`，无需改管理端源码。后端地址为 `http://127.0.0.1:18080`，登录凭据继续使用本机 `.local/local/admin-login.txt`；文档与提交不包含口令或令牌。停止本次宿主进程使用 `make dev-stop`，保留中间件与数据卷。

## 4. 本次真实 HTTP 冒烟

复用已有开发管理员及现有本地用户，通过 loopback TCP 请求实际 API；登录令牌仅存于探测进程内存，结束后已调用登出撤销。

| 检查 | 实际结果 |
| --- | --- |
| `GET /healthz`、`GET /readyz` | 均 200 |
| 未登录 `GET /api/v1/admin/users` | 401 |
| 既有管理员 `POST /api/v1/admin/sessions` | 200 |
| 用户列表 | 200，返回 1 项；`Cache-Control: no-store` |
| 返回用户的详情 | 200，`account_version` 至少为 1 |
| 返回用户的处罚历史 | 200 |
| 列表未知参数 | 400 |
| 探测会话 `DELETE /api/v1/admin/session` | 204 |

所有上述响应包含请求 ID。本地只有 1 项匹配用户，本次未产生下一页游标；多页和混合筛选证据仍由上一阶段隔离集成提供。本轮不增加样例账号、不修改处罚，也没有运行管理端浏览器或微信真机操作。

## 5. 边界与后续

- 当前服务可供本机管理端调试；本地单 DSN 是开发测试配置，不能作为正式分权部署证据。受限角色/RLS 的独立证据见原集成记录。
- 数据库、缓存、MQ 与 HTTP 为真实本地依赖；微信、扫描、外部供应商、正式关怀资料及通知仍保留既有开发/合成边界。`readyz` 200 只表示已装配本地依赖就绪，不表示生产或三端验收通过。
- 未执行正式并发容量验收、前端代理/APM 敏感参数审计或完整管理端交互验收，UM-04/UM-I11 不因此核销。
- 本次仅完成指定开发分支的本地提交与本地启动，未推送、合并主分支或执行生产部署。
