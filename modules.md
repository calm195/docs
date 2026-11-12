# 模块文档总览

更新：2026-11-11。本页集中模块范围与有效输入；实现、缺陷、计划只在[三端入口](README.md)维护。固定设计和契约中的历史 `not-implemented` 不作为当前进度。

增量协议：[内容治理查询](contracts/moderation-query.v1.md)、[特质驳回移除 v5](contracts/matchmaking.v5.md)。

本轮设计：[心愿与内容互动改进v1](design/content-interactions-v1.md)，覆盖心愿发布与图片、解除活跃数量限制、匿名展示、评论楼中楼、收藏/浏览统计、未读角标及词库体验；增量协议见[内容互动v1](contracts/content-interactions.v1.md)，本地实现与验证边界见三端现状。

| 模块 | 当前范围 | 需求/设计 | 协议入口 |
| --- | --- | --- | --- |
| 包分配活动 | 活动报名、审核、个人与理想型标签、候选评分、全员自动分配、人工配对、结果发布和每日任务 | [需求v1](requirements/matchmaking-v1.md)、[设计v1](design/matchmaking-v1.md)、[自动分配设计v3](design/matchmaking-auto-pairing-v3.md) | [活动协议v1](contracts/matchmaking.v1.md)、[活动协议v2](contracts/matchmaking.v2.md)、[活动协议v3](contracts/matchmaking.v3.md)、[理想型特质v4](contracts/matchmaking.v4.md)、[个人特质与自动分配v6](contracts/matchmaking.v6.md)、[偏好与年级v7](contracts/matchmaking.v7.md) |
| 展示字典 | 两端共用名称与排序、后台维护与版本审计 | 三端维护优化 | [展示字典增量](contracts/display-dictionaries.v0.2.1-r1.md) |
| 身份、学生认证与后台账号 | 微信会话、学生卡、人工审核、后台本地账号及角色 | [基础需求](requirements/baseline.md)、[身份与接口设计](design/api.md) | [学生会话](contracts/student-auth.v0.2.0.md)、[学生卡](contracts/student-card.v0.2.0.md)、[人工认证](contracts/verification.v0.2.0.md)、[后台账号](contracts/admin-accounts.v0.2.0.md)、[头像](contracts/avatar.v0.2.1-r2.md)、[会话恢复与统计增量](contracts/trial-improvements.v0.2.1-r2.md) |
| 心愿、应愿与匹配 | 文字许愿、审核、主动上架、唯一匹配与生命周期 | [基础需求](requirements/baseline.md)、[领域/API设计](design/api.md) | [全站0.2.1](contracts/openapi.v0.2.1.json)、[基础语义](contracts/semantics.md)、[体验版增量](contracts/trial-experience.v0.2.1-r1.md)、[支持与热点](contracts/wish-support-hot.v1.md) |
| 聊天、通知、还愿与分享 | 匹配会话、站内通知、故事、分享引用、公开主页 | [基础需求](requirements/baseline.md)、[架构](design/architecture.md) | [全站0.2.1](contracts/openapi.v0.2.1.json)、[聊天读取者增量](contracts/chat-viewer.v0.2.1-r1.md)、[通知与引导增量](contracts/trial-experience.v0.2.1-r1.md)、[分享增量](contracts/content-share.v0.2.1-r1.md) |
| 悄悄鲤与本人胶囊 | 文字、三档身份、昵称、暖评、抱抱、评论开关、本人胶囊与解忧入口 | [范围授权](approvals/2026-10-27-whispers-scope.md)、[需求](requirements/whispers-v1.md)、[详细方案](design/whispers-v1/README.md)、[验收边界](design/whispers-v1/delivery.md) | [whispers/1.0.0](contracts/whispers-v1-r2/README.md) |
| 审核、词库与安全治理 | 内置/自定义词库版本、试跑与恢复、内容复核、举报/处罚/申诉、opaque屏蔽 | [基础需求](requirements/baseline.md)、[安全设计](design/security.md) | [全站契约](contracts/openapi.v0.2.1.json)、[双词库增量](contracts/wordlist-dual.v0.2.1-r2.md)、[屏蔽增量](contracts/blocks.v0.2.1.md)、[树洞契约](contracts/whispers-v1-r2/README.md) |
| 内容发现与管理 | 公开列表搜索、累计热度、滚动周榜及后台内容查询和草稿导出 | 三端体验版改进 | [内容发现与管理增量](contracts/content-discovery.v0.2.1-r1.md) |
| 平台用户管理 | 用户列表/昵称搜索/详情/处罚历史，以及超管直接封禁/禁言 | [查询需求v1.1](requirements/admin-users-v1.1.md)、[直接处置v1.2](requirements/admin-users-v1.2.md)、[查询设计](design/admin-users-v1.1.md)、[处置设计](design/admin-user-restrictions-v1.md) | [admin-users/1.0.0](contracts/admin-users-v1/README.md)、[user-restrictions/1.0.0](contracts/user-restrictions-v1/README.md) |
| 资料广场 | 认证查询/下载、四类反馈、后台资料/分类维护、固定二维码投稿 | [需求v1.1](requirements/resource-plaza-v1.1.md)、[详细方案](design/resource-plaza-v1/README.md) | [resource-plaza/1.0.1](contracts/resource-plaza-v1-r2/README.md)，新增文件及反馈汇总见[体验版改进](contracts/trial-improvements.v0.2.1-r2.md)，其余语义继承[1.0.0](contracts/resource-plaza-v1/semantics.md) |
| 危机、关怀与隐私 | 危机隔离/限定证据、授权处置、账号注销、证据删除与恢复屏障 | [安全设计](design/security.md)、[树洞领域与隐私](design/whispers-v1/domain.md) | [全站0.2.1](contracts/openapi.v0.2.1.json)、[树洞契约](contracts/whispers-v1-r2/README.md) |
| 基础设施与运维 | PG、Redis、独立worker、监控、开发与生产环境隔离 | [架构](design/architecture.md)、[数据库](design/database.md)、[性能](design/performance.md) | [后端运行说明](../liyuanci-backend-go/README.md)、[当前缺口](development/backend/defects.md) |

原始产品设想中的独立搭子、鲤币、语音/媒体等没有因本次整理进入已交付范围。需要扩展时按需求与授权流程新增有效版本。

需求v1.1对旧v1的引用、全站0.2.1对0.2.0的依赖、资料1.0.1对1.0.0的继承属于有效版本链；仍被契约输入指纹依赖的材料保留。旧计划与实现状态已合并至[跨端安排](plans/README.md)和各端三份文档。
