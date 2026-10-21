# 后台账号管理接入说明

2026-10-21；T008/REQ-018、019。契约0.2.0的既有两个操作已实现，字段不改；需后端显式启用后台身份、执行第八版迁移及permissions。默认只有健康端点；本端真实PG/Redis/HTTP验证不代表部署或跨端联调。

## 分页列表

`GET /api/v1/admin/accounts?limit=20&cursor=...`，Bearer为有效后台超管。limit默认20，范围1–50；cursor省略从头。标准成功封装data为`{"items":[{"id":"UUID","version":1,"login_name":"账号名","roles":[],"active":true}],"next_cursor":null}`。后续页原样回传next_cursor；null结束。UUID升序键集分页，游标签名绑定当前超管及本列表，不跨主体/用途复用。不是全量冻结快照，新增账号需要重新遍历才能保证发现。

每页重新检查当前角色；401清理失效会话，403表示缺超管权限；未知/重复参数、非法limit或篡改/跨主体cursor为400 VALIDATION_FAILED。响应no-store，不返回摘要、令牌或创建理由。

## 角色完整替换

`PUT /api/v1/admin/accounts/{id}/roles`，Bearer超管＋Idempotency-Key，正文`{"roles":["review_operator"],"reason":"授权理由","expected_version":1}`。roles必须为数组，可为空，仅接受review_operator/crisis_operator/super_admin；reason非空，expected_version为列表返回的目标Account.version，不能用操作者或审核版本替代。200标准封装返回当前Account。

持锁后复核当前超管，角色替换、目标version加一、操作留迹及回执同事务。404目标不存在；409 VERSION_CONFLICT重新读取目标后由操作者确认；409 IDEMPOTENCY_CONFLICT不得盲目换键重试。同键同请求只重读当前投影，不再次改角色；重放也重新授权，撤掉自身超管后不能凭旧回执调用。角色修改不自动续期或撤销会话，每项请求按数据库当前角色检查，客户端刷新可用入口且禁止仅依赖旧菜单授权。允许自身角色修改，未增设最后超管保护政策。

空角色账号仍可登录/本人改密，无后台领域权限。口令和token不可写日志或持久浏览器存储。账号操作理由只进受限留迹，技术日志不记录理由。

## 实现与验证

后端accounts.go负责服务流程和签名游标、repository.go负责SQL，HTTP严格校验/状态映射；前七版迁移不变，第八版扩展角色修改留迹，非空角色留迹阻止破坏性回退。真实隔离Docker PG/Redis覆盖分页/签名/授权/版本/幂等/并发/留迹回滚；证据见[后端第五阶段](../../liyuanci-backend-go/docs/milestones/phase-05.md)。学生身份四操作已有注入库和隔离验证，但未装配server；学生卡/审核等业务仍未实现。

## 后续审核决策

【用户确认】本轮选择registry.id作为审核处置目标，绑定精确正文版本。后续审核服务与版本模型按此推进；该选择不直接激活moderation-extension.draft.json，也不把尚未实现的审核API标为可用。
