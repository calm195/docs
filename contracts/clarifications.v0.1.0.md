# 契约 0.1.0 技术澄清与未决边界

历史0.1.0澄清；后续用户已确认部分事项，当前以[0.2.0决策记录](decisions.v0.2.0.md)为准。下文“未决”指本记录形成时状态，不覆盖后续确认。

2026-10-21；T002/T008–T017，REQ-002–008、015、018、019。状态：技术澄清本端验证通过；对应业务实现和B02–B07整体阻塞未关闭。依据G3批准的 `ff882ab0c8bdb59d3509e0782c7b13ec77e5c7e4`，以及G1基线v0.2。当前 api/security/database 文件SHA256与G3记录一致。本文只解释现有批准规则，不新增端点、动作、标签枚举、部署限制或登录协议；OpenAPI仍为0.1.0，80个操作均not-implemented。

## 已确认规则及实现约束

| 阻塞 | 可直接执行的批准结论 | 契约现状/技术补全边界 |
| --- | --- | --- |
| B02 | 后台与学生身份域分离；服务端不透明会话、摘要存储、每次查当前授权；首个超管线下部署初始化，后续账号角色由超管管理，无公开后台注册 | AdminLoginInput保持D02阻塞。credential_ref/password_hash是设计容纳的实现选项，不是已选密码方案；登录请求角色不能成为授权来源 |
| B03 | 创建不要求不存在对象版本；更新已有资源校验其expected_version；待扫描返回409 ASSET_NOT_READY，本人资产安全通过仍须人工审核 | VerificationInput目前强制版本与通用创建规则存在具体冲突，未更改schema或强行选账号版本。后端须以identity_reviews目标核对首次创建/驳回重提、并发与幂等，再修订版本化schema；这不是要求用户重新决定认证业务。扫描状态新增读取的路径/协议待技术收敛，不以合成轮询为现有接口 |
| B04 | 列表不得含完整姓名/学号/卡片；身份审核场景下审核运营/超管可读详情及卡，记录访问目的/结果；卡由服务端鉴权解密代理，No-Store，无公开可复用URL；普通学生卡不因别的违规永久留存 | 现有卡200已经是application/octet-stream、string/binary，不能称其缺二进制契约或新增JSON下载URL。JPEG/PNG、5MiB、像素等仍是候选部署参数，需资源兼容实测，未冻结为产品限制。契约校验不等于实际权限/审计/图像服务验证 |
| B05 | 判定命令expected_version属于审核案件；服务端读content_version及hold_epoch再复核；内容限制命令用内容目标kind/id及其版本，不能拿案件id/version代替；内容判定与业务结果分开；解除普通限制不自动上架、不解除危机隔离 | 可补服务端目标映射、版本命名及动作矩阵。不得因此新增处置权限、任意私聊浏览或改变现有生命周期。新增响应字段/枚举需版本化，两端联调后启用；尚未在0.1.0中增加 |
| B06 | 三类词库、草案/版本化发布、扫描结果记录版本；更新后用运营确认样例验证新规则；真实词条由D03交付 | 完整/增量输入、生效基准、归档读取和历史重扫尚未批准，不自行选择；已有数据库状态/两端合成值不是产品确认 |
| B07 | 身份标签可选、受隐藏设置约束；allowed_actions仅展示提示，写入仍查当前权限；会话到期/撤销查DB，后台令牌优先内存；不能用学生/me替代后台会话或前端角色代替当前授权 | 不再要求用户决定标签是否必填。grade/gender词表、后台身份方案、会话体验/参数未定；不猜TTL或刷新接口，也不因缺expires_at字段解释为永久会话 |

## 可直接沿用的合成协议样例

所有样例仅演示当前契约，非真实调用结果；公共请求前缀/api/v1。

- B03：上传202 `{"code":0,"message":"已持久接收","data":{"asset_id":"6c500000-0000-4000-8000-000000000001","scan_status":"pending"},"request_id":"synthetic-r"}`。提交时若扫描未通过：409 `{"code":409,"message":"请求未完成","error_code":"ASSET_NOT_READY","request_id":"synthetic-r"}`。现有Asset枚举是pending/approved/rejected，不把此前提案的passed当成已冻结值。
- B04：`GET /admin/identity-reviews?limit=20` →200，`data:{"items":[{"id":"6c500000-0000-4000-8000-000000000001","version":2,"status":"pending"}],"next_cursor":null}`。卡接口 `GET /admin/identity-reviews/{id}/student-card` →200、Content-Type:application/octet-stream、Cache-Control:no-store、二进制流；无权/未知对象避免枚举、角色无权403、失效会话401，具体对象可见性由当前授权决定。
- B05：`POST /admin/moderation-tasks/{case_id}/decision`，Idempotency-Key加 `{"decision":"approved","expected_version":3}` →200，`data:{"content_decision":"approved","business_outcome":"ready","version":4}`；这不代表公开。旧案件版本返回409 VERSION_CONFLICT；后台服务从案件读取目标，禁止前端猜目标。`version=4`只是schema合成值，具体响应版本归属仍需实现与契约精确对齐，不能替代内容版本。
- B07：会话失效401 UNAUTHENTICATED；有效会话当前角色不足403 FORBIDDEN。身份标签可整体省略，不能因未填grade/gender拒绝原已允许的无标签发布。

兼容性：本澄清不改变0.1.0 wire schema、required、枚举或80项操作；只读契约消费者无需迁移。B03版本修订、扫描读取、B05目标/动作字段及B06/B07新决策须独立版本化；不能把此文当作那些字段已交付。B02–B07真实联调仍按原解除条件留证。新增静态回归检查只验证既有契约边界，不能证明实际服务授权有效。
