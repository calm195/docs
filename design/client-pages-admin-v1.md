# 管理端页面功能清单 v1

核对日期：2026-11-16。源码基线：`97896837eb6ec7d7ceb75925e11b5aa0c9b7cba9`；本次读取时 main 工作区干净。依据为当前 `src/router/index.ts`、各页面/组件、composables、services 与 types，未沿用已回滚实现。本文是设计输入，不表示页面与接口运行验收通过。

## 权限和公共状态

- 登录岗位有审核 `review_operator`、危机 `crisis_operator`、超管 `super_admin`。`admin.can` 的超管继承语义由现有会话仓库维护；菜单与路由均要检查，服务端权限仍为权威。
- 下表 R=审核或超管，C=危机或超管，S=仅超管，A=三个岗位，L=已登录，G=未登录可用。
- 所有列表样板必须包含加载、无数据、读取失败和重试、无权限、长文本；有分页的模块保留页大小/已应用条件/上一页及下一页。
- 写操作保留提交中、校验失败、版本冲突、结果未知原请求重试、成功后刷新失败回执。关弹层不能清掉未知命令。
- 会话撤权、换号、离页时清空敏感数据，丢弃迟到响应；表格不能扩大授权或反查匿名归属。
- 时间使用北京时区；可运营显示词典仍由服务端字典提供。

## 完整路由清单

当前有 33 个业务/账号叶子入口（包含动态词单详情），另有 403 和兜底 404；`/safety` 是重定向容器，`/wordlists` 的父组件是布局容器，不重复计数。

| 路由/源码 | 权限 | 页面/状态与字段 | 现有操作、弹层 | API/复用入口 |
| --- | --- | --- | --- | --- |
| `/` · DashboardView | L | 心愿/树洞热点 TOP10；用户、资料、心愿统计；月/年趋势及数据表 | 刷新、切换范围、热点查看 | `dashboard.ts`；GET `/admin/dashboard`、`/admin/content/hot`；DashboardHotList |
| `/login` · LoginView | G | 账号、口令、忙/失败/登录状态 | 登录；已登录重定向首页 | `admin.ts`、admin-auth-transport |
| `/password` · PasswordView | L | 当前/新口令、错误、提交中 | 改密并重新登录 | `admin.ts` |
| `/users` · UsersView | A | 用户ID/昵称/认证/限制筛选，昵称、认证、限制截止、注册时间 | 查询分页；超管限制动作弹层，读取/重试/版本检查 | `users.ts`、useUsers、UserRestrictionActions；`/admin/users`、详情、处罚、限制 |
| `/identity` · IdentityView | R | 待审名单：序号、姓名、学号；授权详情、卡图、版本、材料状态 | 查看详情、通过/驳回、理由/建议、核对确认、回执 | `identity-transport.ts`；`/admin/identity-reviews`、`/:id`、`/:id/student-card`、`/:id/decision`；IdentityCaseDetail |
| `/identity/history` · IdentityHistoryView | R | 已处理列表含审核结果/审核时间；同源授权只读详情 | 查询分页、查看材料 | IdentityView 的 history 模式 |
| `/matchmaking` · MatchmakingView | R | 当前左右工作区：活动列表/阶段/截止，活动设置、报名、配对、任务四标签 | 新建/保存草稿/发布/取消；报名审核、推荐候选、手工配对；自动方案生成/应用/发布；解除配对；模板维护 | useMatchmaking、MatchmakingProfile/Score/AutoPairing；`/admin/matchmaking/activities` 及活动下子资源 |
| `/matchmaking/task-library` · MatchmakingTaskLibraryView | R | 任务类型、内容、最早天数、启用状态、版本 | 列表分页、新建/编辑、保存；活动内可选择固定首日任务 | MatchmakingView 的 libraryOnly 模式；`/admin/matchmaking/task-library` |
| `/matchmaking/traits` · MatchmakingTraitsView | R | 搜索、选用者性别、审核状态、热度区间/排序、用途；词条、状态、热度、性别人数、创建时间；词云 | 列表/词云、分页、详情和命中依据、审核通过/驳回、原键重试 | useMatchmakingTraits、TraitWordCloud、WordlistMatches；`/admin/matchmaking/traits`、`/cloud`、`/:id`、`/:id/review` |
| `/resources` · ResourcesView | R | 关键词/分类/状态；标题简介、分类状态、当前版本反馈、更新时间 | 新建、详情、编辑、上传(20MiB)、文件/外链选择、上架/下架、下架后编辑、确认/未知重试 | useResources、resources.ts；`/admin/resources`、上传及详情发布下架子资源 |
| `/resource-categories` · ResourceCategoriesView | R | 名称、排序、启用状态 | 新增/编辑弹层、查询分页、原键重试 | useResourceCategories；`/admin/resource-categories` |
| `/content/wishes` · ContentManagementView | R | 标题正文/状态/许愿人/应愿人/创建日期筛选；标题、状态、人名、时间；详情含正文、图片、还愿、应愿/评论/浏览、时刻、评论与补充 | 查询分页、查看/关闭详情、评论翻页、公众号草稿 Markdown 导出（仅exportable） | useContentManagement、ContentImages；`/admin/content/wishes`、`/:id`、`/:id/export` |
| `/content/whispers` · ContentManagementView | R | 标题正文/状态/日期；公开正文和评论，无作者反查入口 | 查询分页、详情、评论翻页；依服务器exportable控制导出 | `/admin/content/whispers`；同组件 kind 分支 |
| `/moderation` · ModerationView | R | 案件/内容ID、状态、类型筛选；案件编号、类型、状态、案件/正文版本；同版本正文图片、涉校提示、词库依据 | 授权详情弹窗→处理弹窗→确认；通过/驳回(理由和建议)、危机升级（另核对岗位）、回执 | useModerationReview；ModerationCaseDetail、WordlistEvidence、CrisisEscalation；content-transport 与 `/admin/moderation` 相关接口 |
| `/whispers/reviews` · WhisperReviewsView | R | 树洞审核列表/详情、类型/状态/案件正文版本/时间、证据 | 详情、审核通过/驳回、危机升级、二次确认、未知重试/回执 | useWhisperReviews、WhisperReviewDetail；`/admin/whispers/reviews` 及 decision/escalate |
| `/wordlists` · WordlistsView | R | 分词库、搜索词条、生效状态/版本、当前词条和修改草稿、历史版本 | 新增/编辑/删除词条、批量导入、保存草稿、试跑匹配、发布、离开未保存确认 | useWordlists、WordlistConfirmation/Preview/RulesEditor；wordlists.ts |
| `/wordlists/builtin` · BuiltinWordlistsView | R | 内置词库当前生效/草稿、词条状态 | 返回生效版、刷新、发布草稿、试跑 | BuiltinWordlistEntries、WordlistConfirmation |
| `/wordlists/history` · WordlistHistoryView | R | 词库筛选、发布记录、资源版本 | 刷新、查看版本详情 | useWordlists |
| `/wordlists/drafts/new` · WordlistDraftView | R | 词库分类、完整词条文本、规则、匹配输入 | 编辑、核对草稿、试跑、确认保存 | WordlistRulesEditor、WordlistPreview、WordlistConfirmation |
| `/wordlists/:id` · WordlistDetailView | R | 完整快照、词条状态、匹配与处置、版本 | 只读查看、试跑、发布草稿、恢复为草稿 | useWordlists |
| `/safety/reports` · ReportsView | A | 普通举报列表、类型/状态/版本；案件内授权正文、说明、已有理由 | 详情→处理/确认；确认/驳回、关联处罚、危机升级（另核权） | SafetyWorkspace reports；`/admin/reports` 等 |
| `/safety/penalties` · PenaltiesView | A | 当前只从本页已确认举报显示处罚依据；全量处罚历史在用户查询 | 读取举报依据、处罚等级/理由、确认、回执 | SafetyWorkspace penalties；safety.ts |
| `/safety/appeals` · AppealsView | A | 申诉列表、正文、原处罚理由、版本状态 | 详情、处理申诉、核对确认、回执 | SafetyWorkspace appeals；`/admin/appeals` 等 |
| `/whispers/reports` · WhisperReportsView | A | 树洞举报案件、授权正文、报告说明、限制、版本 | 决定、普通限制、处罚、危机升级、确认、回执 | useWhisperReports；`/admin/whispers/reports` 与 contents 的 restriction/penalties |
| `/crisis` · CrisisView | C | 危机列表/详情、授权身份显隐、关怀投递、待办、时间线、限定证据 | 接手/跟进/处置、刷新待办、证据读取、假阳性处理、转证据删除、确认 | useCrisisReview；`/admin/crisis-cases`、`/:id/timeline`、`/:id/work`、`/admin/evidence/:id` |
| `/whispers/crises` · WhisperCrisesView | C | 树洞危机、正文版本、投递、时间线 | 处置/误报、转证据删除、核对/确认/未知重试 | useWhisperCrises；`/admin/whispers/crises` 及 actions/false-positive |
| `/whispers/evidence` · WhisperEvidenceView | S | 按证据ID读取范围、类型/保留状态/版本；按任务ID查询删除状态 | 读取、确认删除范围、查询受理任务、清空敏感材料 | useWhisperEvidence；`/admin/whispers/evidence/:id`、deletion-requests、`/deletions/:id` |
| `/evidence-deletion` · EvidenceDeletionView | S | 按ID读取普通证据元信息、关联案件状态、范围版本 | 删除理由、范围核对、确认、回执跳转、清空 | useEvidenceDeletion；`/admin/evidence/:id` GET/DELETE |
| `/deletion-receipts` · DeletionReceiptsView | S | 按删除待办ID/用户主动提供回执查询清理状态 | 查询任务、查询匿名回执、清空 | useDeletionReceipts；`/admin/evidence-deletion-jobs/:id`、`/deletion-receipts/:handle` |
| `/accounts` · AccountsView | S | 账号列表、状态、角色、版本；新账号名/初始口令/角色/理由 | 创建账号、角色全量替换、编辑/确认弹层、未知重试；无资料编辑或启停入口 | accounts.ts；`/admin/accounts`、`/:id/roles` |
| `/report-types` · system/ReportTypesView | S | 类型代码/名称/发布状态 | 新增/编辑、刷新、幂等保存/未知重试 | report-types.ts；`/admin/report-types` |
| `/dictionaries` · system/DictionariesView | S | 类型筛选；代码/名称/排序/启停/快照版本 | 编辑、刷新、幂等保存、未知重试 | dictionaries.ts；`/admin/dictionaries` |
| `/module-guide` · ModuleGuideView | S | 模块、标题、说明、草稿/发布版本及预览 | 新增/移除、保存草稿、发布、原键重试 | moduleGuide.ts；现有模块说明协议 |
| `/403` · ForbiddenView | L | 无权限 | 返回可用入口 | 路由守卫 |
| `/:pathMatch(.*)*` · NotFoundView | L | 页面不存在 | 返回首页 | 路由兜底 |


## 新版设计与关闭标准

本清单记录开发起点的现有能力；新增设计、样板结构及关闭标准统一见[两端页面与组件设计](client-experience-v1.md)。角色、详情授权及原命令恢复不得因抽屉或表格重排改变。
