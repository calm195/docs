# 小程序wx.login与后端会话接入

2026-10-21；T008/REQ-002、014、018。用户确认微信绑定按wx.login，先实现可注入适配器/隔离测试，外部供应商接入保留缺口。四个既有操作不改变Wire字段，状态implemented-injected：服务/HTTP库已实现并有真实PG/Redis/HTTP隔离验证；默认server未装配学生资源，不能当成已部署可请求地址。

## 客户端流程

1. 小程序调用wx.login取得临时code，不以客户端OpenID或本地伪造token登录。
2. POST /api/v1/auth/wechat-sessions，正文`{"code":"wx.login返回的临时值","client_request_id":"本轮请求的随机标识"}`，无需Bearer/Idempotency-Key。200标准封装data含token/me。同轮重试保留同code/client_request_id；成功回执有效且当前会话有效时返回同token，不再调用微信。
3. 无效/已消费/尚无成功回执/到期code返回401，重新wx.login获取新code并生成新请求标识；同code异标识409 IDEMPOTENCY_CONFLICT；429限流后按提示重试；503依赖故障不可当作认证通过。后端不保证外部code调用在进程崩溃后可恢复，客户端须获取新code。
4. GET /api/v1/me携带本系统Bearer更新当前投影。微信身份首次为unverified，必须后续学生卡人工审核才能获得学生认证；不得根据登录成功自行开放心愿权限。

AppSecret只在后端仓库外注入。后端固定HTTPS调用微信code2Session，返回OpenID只进加密/检索存储，session_key/UnionID不下发。小程序不要把code、完整身份或请求正文写日志。token存储依既有平台安全约束，不能使用微信session_key替代。

## 本人资料与退出

GET /me返回Me；当前allowed_actions只包含已交付且当前允许的putMeProfile/deleteAuthSession。不要因为其他动作存在于静态索引便当作授权；未认证也可修改非敏感资料，但不能发布/申请/聊天。受罚投影省略nickname、返回通用penalty_notice及退出动作；401清理会话，不展示历史私密投影。

PUT /api/v1/me/profile携带Bearer/Idempotency-Key，正文nickname/hide_identity_tags/expected_version均必填，false必须显式传。只更新昵称和隐藏标签，不能提交学号、角色或认证状态；版本取Me.version。200返回当前Me，同键重放不重复写入；400字段错误，403受罚，409 VERSION_CONFLICT重新读取再确认。隐藏标签的公开传播随后续公开投影实现，本轮没有交付心愿公开接口。

DELETE /api/v1/auth/session携带Bearer/Idempotency-Key，204后清理本地token。只退出当前会话；旧token重试401，其他会话不受影响。后台token不能调用学生接口，后台四/六项服务参数不能直接当学生TTL。

## 配置与缺口

学生绝对会话期、同code回执期、独立至少32字节SessionKey、事务/锁/幂等期均由后端装配显式提供；不在客户端编造TTL或自动续期。数据库只存会话摘要、code/客户端请求标识HMAC及随机派生材料，不存token/code/OpenID明文。新code同OpenID解析同账号；并发及双代检索不得创建重复账号。

后端需显式九版迁移/permissions、配置openid检索代次，注入微信/KMS/共享Redis及专用身份维护池，调用studentauth.New和RegisterStudent。当前server装配、真实小程序资源、KMS/HMAC供应商和最小执行身份仍未交付；不会自动启用合成适配器。代码/验证说明见[后端学生会话](../../liyuanci-backend-go/docs/student-auth.md)和[第五阶段](../../liyuanci-backend-go/docs/milestones/phase-05.md)。无跨端联调或生产验收。
