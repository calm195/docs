# 资料广场后端实现与独立验证 r1

日期：2026-10-29（Asia/Shanghai）。任务 RP-B01/B02/B03，关联 REQ-023、REQ-002、REQ-016、REQ-018、REQ-019、REQ-021。状态：**15操作已实现，后端隔离 PostgreSQL/HTTP 验证通过；源码未提交，三端真实联调及生产验收未执行**。

## 1. 授权、基点与正式输入

本轮用户明确要求“调起subagent完成三端开发任务”，据此执行实际后端开发。源码工作树 `/Users/kurous/code/liyuanci/liyuanci-backend-go`，分支 `develop`，完整 HEAD 基点 `96f3754e02aa2c0c563ea2aa4385f0917e535ac4`，开始时干净，当前为本轮未提交修改。文件清单及 SHA-256 见[结果与源码指纹](../validation/2026-10-29-resource-plaza-implementation-r1/result.json)。

docs 独立工作树 `/private/tmp/liyuanci-rp-docs-backend`，分支 `backend-develop`，基点 `83945210cb5f9882f4ab3d142a6c004cfacf5fd9`。主代理准备工作树时将干净分支快进到已推送契约；本轮没有业务源码提交、推送、合并、已有开发库迁移或应用部署。

消费[正式契约1.0.1](../../../contracts/resource-plaza-v1-r2/README.md)，manifest SHA-256 `e577c9706f2ab90f000ca26a556ffb0e6c9c5cf9c9ead0dfe2a086e1c6c2489f`。其字段、动作、文本及并发规则继承[1.0.0](../../../contracts/resource-plaza-v1/README.md)，只补充创建命令成功回执重放遇隐私屏障时的404声明；这是本轮真实响应检查发现的原OpenAPI漏项，原固定包保持原样。[原开发工作包](2026-10-29-resource-plaza-development-r1.md)与[需求v1.1](../../../requirements/resource-plaza-v1.1.md)保持原指纹。

## 2. 完成范围

| 范围 | 实现与本端证据 |
| --- | --- |
| 数据与权限 | 新0029迁移、分类/资料/反馈/审计四表独立实体；分类唯一键、引用与状态/版本约束、数据库中文注释；RLS和列权限；学生没有资料正文写权限，普通后台无资料删除权，危机专岗无资料表权限 |
| 8查询 | 学生分类/列表/详情/取链，后台分类/详情及资料列表/详情；逐请求当前会话/epoch/角色/认证/处罚检查，禁言允许读/取链；ASCII字面搜索、分类交集及加密绑定游标，30分钟期限 |
| 6后台写入 | 完整草稿、分类维护、内容保存、显式上下架；已发布须先下架才编辑，取消/保存不会恢复上架；当前版本、分类占用、名称冲突与同键不同输入明确拒绝；无变化保存不增版本或清票 |
| 学生反馈 | 四类一票可改，反馈版本独立于资料版本，当前内容版汇总按active账号批量聚合；同键重放返回当前选择，旧新键版本冲突；无举报、案件或自动下架 |
| 幂等与加密 | 复用现有最小command_receipts，生命周期回执不因TTL重新创建；先当前授权和对象可见性，再解析成功回执；链接/提取码及后台下架理由按用途、对象和版本信封加密；日志不记录正文、q、链接、码或主体关联 |
| 隐私与受控屏障 | 内容换版同事务删除旧票及其回执；既有cleanAccount清理反馈，注销立即退出汇总；恢复重新执行删除。内部SetBarrier限超级管理员，按分类/资料锁序改变屏障、离线与资源版本并留审计，没有公开屏障或举报接口 |
| HTTP与装配 | 15条显式Gin路由、no-store、201创建及200其他成功、错误无data、严格请求白名单/重复字段/整数token/媒体类型/大小上限；studentapi可选Resources配置，devapp与完整业务运行装配注入独立受限池；结构缺失失败关闭，基础make run仍为健康模式 |

## 3. 并发与工程取舍

领域事务复用 `command.LockPlan` 的主体guard及新增 `resource_category`、`resource_material` 锁种类；先主体授权再发现并锁对象，以保证无权角色得到403而不因目标是否存在发生404差异。锁序为后台主体/学生账号→排序分类→资料→本人反馈。分类创建/改名另取固定技术锁保护名称唯一性；不锁所有资料来处理一次分类变更。

写事务以READ COMMITTED取得最新锁定对象；分类归属漂移后重试整个事务，不追加逆序锁。读事务采用REPEATABLE READ及有限序列化重试，防止列表元信息与后续反馈汇总读到不同内容版本。列表分类和反馈均批量查询；不同页大小的分类读取数固定为一次。服务层直接写调用也重复正式输入规范化，避免绕过HTTP产生非法投影。

内容屏障只能限制读取/发布，普通反馈不会设置或解除屏障。解除屏障后资料仍离线，需要显式重新发布。内部治理调用属于受控能力，未增加用户投稿、文件托管、链接抓取、下载计数或微信发送。

## 4. 实际验证

- `make fmt`、`make check`（格式、`go vet ./...`、全量`go test -race -cover ./...`）、`make build`及源码 `git diff --check`通过；[质量日志](../validation/2026-10-29-resource-plaza-implementation-r1/check.txt)、[构建日志](../validation/2026-10-29-resource-plaza-implementation-r1/build.txt)。常规全量命令中依赖专用环境的其他历史集成用例仍按原规则跳过，不将其记为本轮真实测试。
- 专用 `APP_RESOURCE_TEST_DSN` 指向本机PG测试父库，测试新建随机 `resource_test_*` 库、显式应用迁移/权限、以学生/后台/危机受限角色验证，结束关闭连接并删本次临时库。`go test -race ./internal/resourceplaza ./internal/httpapi -count=1 -v`通过；[日志](../validation/2026-10-29-resource-plaza-implementation-r1/integration.txt)覆盖15操作、31正式文本向量、31原始协议向量与重复Header、跨域/禁言/封禁/角色撤销/epoch、版本/幂等、内容换版清理、隐私屏障、分页/跨主体跨条件游标、同键并发及两不同管理员5轮分类停用/创建竞争。
- 同一真实HTTP运行捕获355个响应，全部通过1.0.1的标准schema及文本、动作、版本/反馈汇总扩展约束，覆盖15个成功操作。脱敏合成[原始响应](../validation/2026-10-29-resource-plaza-implementation-r1/http-responses.json)、[可复跑校验器](../validation/2026-10-29-resource-plaza-implementation-r1/validate_http.py)。调用校验器使用契约requirements.txt中的Python依赖。
- 主代理补充并实际运行完整 `TestPrivacyDeletion`，本代理在最终实现后复跑；18子项通过，新增资料反馈场景验证注销立即退出统计/旧会话与回执401、真实worker物理清理及恢复旧账号/票/回执后再次删除，保留平台资料/分类和其他人票；[真实PG隐私日志](../validation/2026-10-29-resource-plaza-implementation-r1/privacy.txt)。外部全副本清理、KMS与账号是明确合成适配。
- 列表、关键词搜索、分类各100次串行真实HTTP计时，P95原值见结果JSON及integration日志；数据量为本测试合成小样本，不能外推生产并发容量。分类读取次数断言覆盖limit=1/50，避免逐行分类查询。
- `contracts/resource-plaza-v1/build.py`只读生成比对、1.0.1契约校验、`python3 scripts/check_documents.py`和docs `git diff --check`均通过。Python工具现有LibreSSL警告不涉及网络调用，也未用于替代业务测试。

## 5. 三端接入与剩余边界

前端按1.0.1完整OpenAPI及继承规范接入；所有操作已在代码装配，HTTP测试通过临时 `httptest.Server` 往返真实PG，不留下常驻测试服务或合成账号。测试令牌只存在进程内，不写交付证据。可复跑上述测试重建环境；需要常驻联调环境时应由专用迁移入口显式迁移目标测试库，再用相同源码制品及各角色测试账号启动。

当前未提交源码，制品标识应使用源码基点和本轮指纹，不能伪称已有新提交SHA。正式二维码由小程序接收负责人原图；其缺失不阻塞后端接口。浏览器/小程序对本后端的联合流程、微信真机剪贴板和二维码识别、真实网盘链接及生产容量/供应商验收仍未执行。此记录不签发人工G1/G2/G3，也不代表已部署或可直接上线。
