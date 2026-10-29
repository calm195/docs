# 后端用户管理独立开发工作包 r1

日期2026-10-29；UM-02，REQ-022、016、018、019、021。状态：**设计/接入工作包，未实施**。源码只读基点 `develop` / `5d6fcd614edb8e048677d8bc9813a790b632f0ac`，读取时干净；docs基点 `codex/admin-user-management` / `075e52d57a74cb520668c8ddbbb29ae7fc813ea8`。正式源码开发使用源码develop与docs backend-develop，开始前按AGENTS复核状态；本包本次在共享设计分支交付，不切换或修改源码。

## 1. 固定输入及实施目标

必读[需求v1.1](../../../requirements/admin-users-v1.1.md)、[设计v1.1](../../../design/admin-users-v1.1.md)、[契约包](../../../contracts/admin-users-v1/README.md)、[规范语义](../../../contracts/admin-users-v1/semantics.md)、[联调矩阵](../../../design/admin-users-delivery-v1.md)。模块 `admin-users/1.0.0` 新增3个GET，不改原写命令Wire，不实现编辑/删除/任意解罚。

| 操作 | 输入 | 输出及权威数据 |
| --- | --- | --- |
| adminUsersList | user_id/nickname/verification/restriction/limit/cursor | UserPageEnvelope；accounts当前普通昵称/认证、penalties当前有效限制 |
| adminUserDetail | id | UserDetailEnvelope；额外account_version、授权有效处罚摘要与导航提示 |
| adminUserPenaltiesList | id/limit/cursor | UserPenaltyPageEnvelope；按权限过滤的历史及安全案件导航 |

完整参数/字段/null/错误以OpenAPI和规范语义为准；不能直接将ORM实体序列化，实体均 `json:"-"`，需独立响应DTO。不创建单独用户目录或把新状态写进accounts替代penalties。

## 2. 已定位源码与接口选择

【只读事实】`internal/entity/account.go`：public.accounts含lifecycle/verification/version/nickname/created_at；public.penalties含account_id/action_kind/starts_at/ends_at/revoked_at/content_id/reason_cipher；public.appeals含独立version。`internal/safety/commands.go` 的普通处罚期望目标为command.Account，申诉决策为command.Appeal；`internal/safety/read.go` 既有案件读取限定ordinaryCase并做解密/留迹。原处罚guard再次核验目标存续、内容作者、精确版本与违规依据，不能通过新增读接口绕过。

参考 `internal/safety/service.go` 的后台鉴权/读事务及原账号读屏障协议；参考 `internal/wish/public_profile_repository.go` 当前普通昵称来源。`internal/httpapi/safety.go` 既有POST用户处罚及原GET申诉/举报挂载；新增GET与POST同路径可共存。参考原privacy清理入口整合非涉案查询审计，不引入永久记录用户搜索值的新表。源码路径为定位建议，进入实施时复核。

## 3. 建议任务顺序与交付

| 任务 | 内容 | 本端完成标准 |
| --- | --- | --- |
| UM-B01 DTO/HTTP | 三个GET、后台会话域、严格参数及所有错误；同一响应as_of一致 | 响应schema与样例一致；未知/重复/空非法参数及401/403/404检查通过 |
| UM-B02 查询 | active账号白名单，普通昵称包含查询、AND筛选、限制计算；limit+1键集 | 真实PG覆盖中部搜索/重名/特殊字符/大小写/50边界/禁言到期/同时间ID顺序；无前截断后过滤和N+1 |
| UM-B03 安全投影 | permission-first处罚历史、有效摘要、固定安全理由、普通案件关联、动作提示 | 普通运营无危机历史/计数，匿名来源不返回内容链接；不可解密自由理由后直接输出；case refs按原访问控制核验 |
| UM-B04 游标与审计 | 30分钟、主体/用途/目标/筛选/排序/limit绑定，密钥化摘要；全链路日志脱敏、非涉案留迹清理 | 损坏/错配/过期400；nickname不在载荷/日志/SQL/APM；注销清理查询审计关联 |
| UM-B05 集成验证 | 原账号锁/读屏障并发、撤权、注销、版本供给及命令回归、性能 | 真实隔离DB+HTTP报告；Account.version真实供给；UM-I01–I10对应后端项逐条证据 |

投影查询建议使用只读专用仓储/服务，SQL一次取本页所需基础与限制状态；权限过滤在limit前，详情有效摘要与全局restriction分别计算。具体索引先看现有迁移与查询计划，不预先引入搜索引擎；ASCII折叠必须独立于数据库locale，关键词与昵称使用同一规则。子串搜索不因有B-tree而被宣称达标。

导航条件：view_penalties允许查历史；open_case_workspace仅在存在有权访问的普通合格违规案件时启用；open_appeal_workspace仅在存在有权访问的普通待办申诉时启用。不要将角色判断直接等同于每个目标都有案件。用户页仅返回普通案件链接，树洞/危机从专用工作台开始；权限变化及注销后重新读取应收紧投影。

## 4. 验证输入、边界与风险

使用[合成样例](../../../contracts/admin-users-v1/examples.json)建立可重建隔离夹具；Mock游标只是外观样例，真实后端必须自己签发，不能放行synthetic字符串。搜索向量为规范对照，非数据库实现。必须用真实PG验证字符串语义与分页，真实HTTP验证角色/状态/响应头；不以仅schema通过替代。

重点边界：starts_at=as_of有效、ends_at=as_of无效；warning不限制；ban优先；多mute取最晚有效结束；同ID多处罚先过滤再分页；缺失历史content关联不给链接；注销屏障后新发起读取不得见旧数据；不要将不具权限的处罚ID放进active_penalties；安全摘要从固定文案取得，不复制案件原文。

实际验证仅完成本次文档/契约静态检查，未做上述应用验证。预计依赖为PG、后台身份、原安全/隐私服务与日志配置；外部供应商和微信并非三个GET本端开发的先决条件，只有涉及原流程真实联调时按原依赖清单准入。任何阻塞只记录受影响项，不能用假数据冒充运行可用。

后续完整交付应注明源码develop精确提交、docs backend-develop基点、包指纹、实际测试、真实/模拟边界和未完成项；源码已授权提交时先提交源码再登记文档。当前没有业务实现和源码提交，不能标为UM-02完成。
