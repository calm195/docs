# 用户直接处置迁移与本地联调 r1

日期：2026-10-29（Asia/Shanghai）；关联 REQ-022-I/J/K/L、REQ-016、REQ-018、REQ-019；契约 user-restrictions/1.0.0、admin-users/1.0.0。用户明确授权本地0028迁移、重启新后端与四操作真实联调；本轮没有提交、推送、合并或生产部署。

## 基点与证据关系

后端 `develop` / `ca9f68ac51285dafee88431d7610d9856e394985` 加未提交实现，管理端 `develop` / `69f07a2af4c84b4da8026c636c7a06463491f548` 加未提交实现。docs采用本跨端任务独立 `admin-develop` 工作树，基点 `3412a7549e69bd38125e1a7dd401a743adcbe309`；主 docs 的 backend-develop 工作区保持原样。

补充[前次后端交付](2026-10-29-user-restrictions-r1.md)，原 SHA-256 为 `e999f9746afcbffc79b009baca398ae4c4d60d4757aee121717dde822145fed9`；原固定记录不改。当前源码与前次固定指纹一致，本轮无源码修改：[源码核对](../validation/2026-10-29-user-restrictions-live-r1/source-verification.json)。上轮 make fmt/check/build 和隔离SQL检查不冒充本轮新执行；本轮重新构建迁移及API制品并执行下述实际验证。

## 本地迁移与重启事实

环境确认为 `liyuanci-local` 本地Docker PostgreSQL/Redis和宿主API，业务库端口15432；API18080；独立恢复库15433未被操作。当前已显式启用本地业务测试单DSN模式，应用身份具有现有多业务角色，不将此联调称为正式分角色数据库最小权限验收。

1. 预检账本为连续1–27，共33个账号、40条处罚。用pg_dump自定义格式创建私有备份，518148字节，SHA-256 `e9fef6e0d9cee807a684c098fcf1486936119d8e6ef09063ee5f8c4ccd294956`；pg_restore --list目录检查成功。备份位于后端忽略目录 `.local/local/user-restrictions-live-20261029/before-0028.dump`，权限0600，未复制数据库内容或凭据到docs；本轮未执行恢复演练。[备份摘要](../validation/2026-10-29-user-restrictions-live-r1/backup-summary.json)。
2. 从当前工作区执行 `go build -trimpath` 构建 cmd/migrate 与 cmd/server；核验旧API PID归属后发送SIGTERM，只停止API。用原迁移专用身份从私有配置注入APP_DATABASE_DSN，执行新迁移制品 `up`；未在命令参数或输出中暴露DSN。
3. 0028于北京时间2026-10-29 14:22:10入账。账本校验和 `63c888613b41b1463c2e1e8ac8ff1da62818e338a1b83e7e7ae7efb8e675aea4` 与当前up+down字节SHA-256相同；新增三字段及中文注释、direct_penalty_scope约束已存在。实际字段注释经既有GORM实体同步采用实体说明；约束和类型保持预期。迁移前后账号/处罚数量均未变化。[迁移元数据](../validation/2026-10-29-user-restrictions-live-r1/migration.json)、[迁移输出](../validation/2026-10-29-user-restrictions-live-r1/migration.log)。
4. 使用既有 `python3 scripts/dev.py api` 入口重新构建和启动宿主API。旧PID58167，新PID93670，启动器93653；运行制品SHA-256 `cb3771b536e495f8928816a9d45811bab5b90513420cb65ca94bb6ca6a054ce9`。healthz与readyz均200，原5个worker PID未变；既有配置、密钥与登录凭据文件指纹未变。
5. `make dev-doctor` 实际通过：数据库身份/业务结构、Redis、业务依赖及共享对象目录检查成功；[输出](../validation/2026-10-29-user-restrictions-live-r1/doctor.log)。开发依赖诊断不等于外部供应商或生产就绪验收。

## 真实浏览器、事务与数据核对

[管理端联调记录](../../admin/milestones/2026-10-29-user-restrictions-live-r1.md)记录实际Chrome页面点击、真实登录、四操作与三角色授权，无HTTP拦截。目标是既有合成账号 `88f087a2-2e29-570b-9272-5dbfc278bf8d`，初始版本1且无处罚。正常→封禁→同时禁言→解封仍禁言→取消禁言，四次POST均200、版本递增至5；目标最终active且无有效限制。日志抽取仅保留时间、请求ID、路由模板、状态及耗时：[HTTP事件](../validation/2026-10-29-user-restrictions-live-r1/http-requests.json)。

最终[SQL核对](../validation/2026-10-29-user-restrictions-live-r1/database-result.json)通过：

- 恰好新增一条direct ban、一条direct mute，均已撤销，处罚版本均2；直接来源没有内容引用，mute期限恰好168小时。
- 创建与解除理由均为JSON信封密文对象，不含输入测试理由明文；解除操作者字段已记录。没有在文档中输出密文或密钥。
- 目标账号四类user_restriction审计各1条，四个HTTP命令幂等回执各1条；封禁同键重放不增加处罚或版本。两条站内penalty_notice已落库；未验证外部消息送达。
- 用备份pg_restore数据流与当前pg_dump数据流在内存中逐字段比较：全部33个账号中仅目标的version从1变5，其他32个账号完全相同；原40条处罚既有字段完全相同，迁移新增source_kind均为case；新增2条仅属于目标。没有为恢复测试状态删除审计、处罚或回执。
- 空理由400、旧版本409、重复解除409；无凭据401；两种普通后台岗位的状态GET与四POST全部403；等待真实退出204后旧令牌401。会话并发探测和登录名读取的初次脚本问题及复验见管理端记录，不混淆为源码缺陷修复。

## 文件、验证与后续边界

新增本记录与同名validation目录中的备份摘要、迁移元数据/日志、SQL结果、HTTP事件、doctor输出及源码核对；更新后端索引与固定清单。文档交付运行 `python3 scripts/check_documents.py`（包含固定指纹）及两源码仓库/本docs工作树 `git diff --check`；源码未变，不重复上轮全套单元检查。文档不携带本地口令、会话令牌、私有DSN或数据库备份。

后端和管理端保留运行，业务与恢复容器及worker均未重置。已经存在direct审计，0028 down按设计应拒绝；本轮没有在现有开发库尝试down。以后回退应用仍应保留schema和审计，按问题向前修复。合成用户保留两条已撤销处罚和相关留迹，便于后续查看。

未执行：真实微信/小程序设备、外部KMS或外部通知送达、生产发布、备份恢复、旧业务互动取消与内容复活专项重测、完整三端验收。以上边界不阻止本次本地管理端四动作真实联调完成，AI不签发G1/G2/G3。
