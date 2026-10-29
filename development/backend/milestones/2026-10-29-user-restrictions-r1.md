# 平台用户直接处置后端交付 r1

日期：2026-10-29（Asia/Shanghai）；关联REQ-022-I/J/K/L、REQ-016、REQ-018、REQ-019。用户明确授权用户页填写理由直接封禁/解封、禁言/取消禁言，并新增后端接口和契约；[需求v1.2](../../../requirements/admin-users-v1.2.md)、[设计](../../../design/admin-user-restrictions-v1.md)、[user-restrictions/1.0.0](../../../contracts/user-restrictions-v1/README.md)。AI未签发G1/G2/G3。

## 基点、范围与文件

后端源码 `develop` / `ca9f68ac51285dafee88431d7610d9856e394985`，基于该HEAD的未提交修改；[完整文件指纹](../validation/2026-10-29-user-restrictions-workspace-r1.json)记录本轮工作区。管理端源码 `develop` / `69f07a2af4c84b4da8026c636c7a06463491f548` 加未提交修改，见[管理端交付](../../admin/milestones/2026-10-29-user-restrictions-r1.md)。docs使用本跨端任务独立工作树 `docs-admin-develop`、分支 `admin-develop`、基点 `3412a7549e69bd38125e1a7dd401a743adcbe309`；依据治理允许单任务跨端共用docs分支，不改主工作树backend-develop及其无关变更。

新增 `internal/safety/user_restrictions.go`、`internal/httpapi/user_restrictions.go` 与0028上下迁移；修改safety命令/申诉读取、HTTP注册、Penalty实体、迁移目录及集成测试。未新增依赖，未提交/推送/部署。

## 服务端行为

- GET `/api/v1/admin/users/{id}/restrictions`；四条POST `/api/v1/admin/users/{id}/restrictions/ban`、`unban`、`mute`、`unmute`。均要求super_admin，原三个只读GET及原案件权限不变。
- 写入只接受reason与expected_version，并要求Idempotency-Key。理由首尾裁剪后非空、UTF-8最大2000字节；版本使用Account.version；不接受查询参数或任意扩展字段。401/403/404/409及依赖失败沿既有错误封装，响应no-store。
- 新建直接处罚复用原处罚表、账号/参与者/资源锁、事务、幂等与限制副作用。封禁永久至解除，禁言168小时；source_kind=direct，content_id为空，violation_ref为处罚自身技术引用，不伪造违规内容。content_version=1仅为兼容存储值。
- 两种限制同时返回。解封/取消禁言逐条撤销当前有效同类限制，包括既有案件来源；保留另一类型、危机/内容限制和隐私屏障，不恢复旧互动。状态不支持动作时409。
- 处罚理由加密；直接解除将独立理由密文、操作者写入每条处罚，保留原理由，递增处罚与账号版本并审计。注销删除Penalty整行包含新增字段。原申诉撤销亦递增Account.version，避免旧直接处置确认有效。
- 直接处罚允许本人申诉；后台直接来源申诉列表、详情、决定仅super_admin，其他来源沿原案件授权。注销与撤权后旧键重放重新授权，不返回已不可访问账号。

## 实际检查及验证边界

| 检查 | 实际结果 |
| --- | --- |
| make fmt | 通过；[输出](../validation/2026-10-29-user-restrictions-format-r1.txt) |
| make check | 格式只读检查、go vet、全量go test -race -cover通过；[输出](../validation/2026-10-29-user-restrictions-check-r1.txt)。环境门控集成不算由此执行 |
| make build | 当前Makefile全部9个进程构建通过；[输出](../validation/2026-10-29-user-restrictions-build-r1.txt) |
| 显式PostgreSQL集成：TestAdminUsersQuery、TestSafetyGovernance | 配置APP_MODERATION_TEST_DSN后真实执行，通过；[输出](../validation/2026-10-29-user-restrictions-integration-r1.txt) |
| `go test -race ./internal/moderation -run TestAdminUsersQuery/直接用户操作 -count=1 -v` | 最终并发及迁移保护增量通过；[输出](../validation/2026-10-29-user-restrictions-direct-race-r1.txt) |
| OpenAPI3.1、JSON Schema、4种并存状态和请求样例、输入SHA-256 | 使用已有Python验证环境离线通过；[输出](../validation/2026-10-29-user-restrictions-contract-r1.txt) |

显式集成使用本机127.0.0.1:15432 PostgreSQL，新建随机隔离数据库、0028完整迁移、合成账号、真实SQL/事务/受限数据库角色和httptest HTTP。测试结束清理自建数据库；未在既有开发业务库写入测试账号或应用迁移。学生申诉使用独立liyuanci_api身份，后台使用liyuanci_admin身份。

专项覆盖：普通角色403；ban同键不重复；旧版本409；ban/mute并存；解除保留另一类型；全量解除多条有效封禁；空操作409；解除理由密文；本人直接申诉和超管处理、普通岗拒绝；同版本并发仅一笔200、一笔409；存在直接审计时down失败且查询仍可用；撤权403；注销后GET及旧幂等键均404。完整旧治理用例覆盖处罚回滚、申诉不复活与并发交互。最终仅导入分组格式调整后重跑全量检查和构建；显式SQL测试的行为源码未再变更。

浏览器由管理端使用合成HTTP验证，不是浏览器到本次真实数据库的端到端联调。加密使用测试密钥，通知验证本地记录/事务，不包含实际外部发送；未执行三端真机、外部供应商或生产验收。

## 迁移、启用与回退

1. 变更窗口内使用迁移专用身份，通过外部APP_DATABASE_DSN配置目标库；确认现有迁移基线和备份后，对新构建执行 `bin/migrate up`。迁移不是普通API启动的隐式动作。
2. 核对0028已入账、source_kind/revoke_reason_cipher/revoked_by与中文字段注释存在，然后重启到新后端构建，最后使用新管理端构建。
3. 用合成用户分别验证正常→封禁→禁言→解封（仍禁言）→取消禁言，查看审计及注销/撤权拒绝；业务用户操作需独立真实操作授权。
4. 0028为添加字段迁移；已存在direct记录或直接解除审计时down主动拒绝，不能为回退代码删除历史审计。保持向前兼容schema并按问题修复；不存在相关数据时才可按显式迁移工具回退。

以上为交接步骤，本轮未执行既有业务库迁移或运行服务重启，也未发布新构建。文档/固定指纹检查和Git差异检查在交付前执行；精确实现提交待用户授权后以新的补充记录关联。
