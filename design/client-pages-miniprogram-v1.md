# 小程序页面功能清单 v1

核对日期：2026-11-16。当前基线 `32d7d7500a770a220f35cc9281bb3dfb0e59fa3c`，开始盘点时工作区干净。实际注册39个路由。下表为现有功能，不代表新版已实现或验收。

## 全局约束

- 五个主入口为首页、心愿池、悄悄话、资料、我的；主页面使用自定义导航与 AppTabBar，子页面以微信原生导航为准。
- 每页必须覆盖适用的加载、空态、读取失败/重试、未登录、待认证/认证驳回、处罚受限、权限变化、内容不可用、长内容及分页状态；写入还覆盖提交中、成功、冲突与结果未知原请求重试。
- 公开内容与本人草稿/审核记录使用不同投影；匿名树洞身份不能关联公开主页。已停用/删除/隐藏内容不得通过缓存或统计恢复。
- 使用现有 AppNotice/通知宿主、会话代次、离页失效机制；暗色主题使用现有 theme tokens。不能把示例页面或H5截图当作微信设备业务验收。

## 路由、字段和操作

每个源码路径为 `src/<路由>.vue`。

| 路由 | 核心信息与状态 | 现有操作 | 主要组件/接口 |
| --- | --- | --- | --- |
| pages/index/index | 登录问候、三业务入口、包分配入口、周热点、新鲜心愿、悄悄话；加载与空态 | 跳转个人、登录、业务快捷页、热点与详情 | AppPage、WishPreview、WhisperContent、HotContentList；use-home-wishes/use-hot-content/use-whisper-feed |
| pages/hot-content/index | 热门心愿/悄悄话及统计、空态/错误 | 类型切换、刷新、查看详情 | HotContentList、use-hot-content |
| pages/login/index | 登录/已登录、待继续心愿动作 | 微信登录、认证、返回心愿/首页 | 用户store、use-wish-action-return |
| pages/verification/index | 学号/学校/学生卡、安全扫描、待审/通过/驳回、修订意见 | 选卡/压缩、上传扫描、查询、提交、刷新；离页清私有输入 | auth、verification API |
| pages/wish-detail/index | 心愿正文图文、身份标签、类别/校区/报答、发布及截止时间、支持/评论/应愿/浏览、审核/隐私屏障、本人状态/动作 | 点赞取消、收藏、评论定位与楼内回复、作者补充、应愿、编辑/撤回/到期刷新、举报/隐藏/分享、应愿管理/还愿链 | ContentStats、ContentToolbar、WishImages、WishSupportButton、FavoriteButton、WishComments、ShareActions；wishes/stories/interactions |
| pages/wishes/index | 心愿列表、类别/搜索/本人筛选、身份与统计、草稿编辑 | 查询分页、打开详情、发布/编辑、收藏及隐藏 | WishPond、use-wish-pond-page |
| pages/wishes/shortcut | 心愿快捷入口参数对应的列表或编辑面板 | 同心愿池，按参数直接进入发布/本人 | 同上，必须保留入口参数 |
| pages/applications/index | 我发起/收到的应愿、心愿上下文、申请留言、申请状态与权限 | 提交、接受、撤回、状态筛选、查看详情/聊天、分页 | applications、wishes、chat API |
| pages/public-profile/index | 公开昵称/头像/标签、公开心愿与故事、统计；账号或内容不可用 | 详情、举报、屏蔽、分页 | ProfileAvatar、IdentityTags、ContentStats；applications API |
| pages/inbox/index | 会话摘要/心愿标题、未读、通知类型/状态/目标、空态 | 会话与通知切换、打开关联内容、标记已读、分页 | chat API |
| pages/chat/index | 会话可读/可写、历史消息、未读到达、发送审核回执及驳回原因 | 发送、查询/重试原命令、历史分页、滚到最新、举报消息、阅读确认 | chat API，既有收件/发件状态分离 |
| pages/stories/index | 还愿故事墙、正文图文与统计 | 列表筛选/分页、查看/分享 | StoryWall、use-content-share |
| pages/story-editor/index | 心愿关联故事、审核原因和建议、编辑状态 | 保存/发布/撤回等服务端允许动作、刷新、回心愿 | wishes/stories API |
| pages/settings/index | 昵称头像、校区性别、入学年份/学历/年级、MBTI、公开展示、保存/未知结果 | 头像选取/保存、资料自动/手动保存、年级调整、MBTI选择、复制测评链接、返回活动、注销入口 | settings/avatar API、用户store |
| pages/blacklist/index | 当前屏蔽目标、列表与分页、未知请求 | 屏蔽、解除、刷新/加载更多、原命令重试 | settings/applications/wishes/stories API |
| pages/report/index | 举报来源/版本、已发布类型、说明、受理/未知结果 | 选择类型、提交、核实结果 | safety/safety-targets |
| pages/safety/index | 警告、服务端确认时间、申诉记录、限制提示 | 读警告、倒计时确认、提申诉/查看申诉、切换与分页 | safety/safety-targets |
| pages/care/index | 本人关怀通知、援助目录、来源/版本/核验日期 | 查看通知、读取卡片、分页 | care/chat |
| pages/deletion/index | 注销资格、安全告知、不可逆确认、处理回执/进度 | 检查资格、确认提交、原请求重试、查询/复制回执 | 删除store与deletion API |
| pages/whispers/index | 树洞列表、昵称快照、标题正文、抱抱/暖评/浏览、搜索与空态 | 搜索/分页、抱抱、打开详情、写心事、我的记录/回响/援助 | WhisperContent、ContentStats、ContentToolbar、use-whisper-feed |
| pages/whispers/detail | 公开帖/本人未公开帖、审核意见、抱抱/评论/浏览、评论开关与分页 | 抱抱、收藏、举报/屏蔽、编辑/撤回、写暖评、楼内回复、作者补充和本人记录 | WhisperPostEditor、WhisperReplies、ContentStats、FavoriteButton；whispers API |
| pages/whispers/editor | 标题/正文/匿名身份选择、限长、扫描审核与未知结果 | 提交/编辑、身份选择、重试；保留暂存逻辑 | WhisperPostEditor、use-whisper-post-editor |
| pages/whispers/mine | 本人帖子各状态、正文可见性、审核理由与建议 | 查看、发布入口、分页 | whispers API |
| pages/whispers/nickname | 当前已审昵称、待审/驳回候选、审核建议 | 新昵称提交、刷新、原命令重试 | whispers API |
| pages/whispers/help | 无需登录的核验援助目录、可用/不可用状态、来源与核验日期 | 查看渠道、本人关怀入口 | whispers API |
| pages/whispers/report | 当前公开来源/版本、举报类型、说明 | 读取来源、提交举报、原请求重试 | whispers API |
| pages/whispers/comment-editor | 新暖评/楼内回复/编辑、父帖上下文、身份、500字、审核/原帖变化/关闭评论 | 选择身份、提交、重试；原帖变更须重新阅读 | WhisperContent、WhisperIdentity；whispers API |
| pages/whispers/notifications | 模块未读与通知目标；胶囊可读状态以服务端为准 | 标记已读、打开来源、分页、读取胶囊 | whispers API |
| pages/capsules/index | 本人胶囊状态、预约时间、解锁后预览、空态 | 创建、详情、分页 | whispers API |
| pages/capsules/create | 500字正文、安全告知、预约日期/时间/秒、服务端默认次日/额度 | 确认告知、提交、原请求重试、打开回执 | use-whisper-page；capsule接口 |
| pages/capsules/detail | 胶囊状态、预约/服务端时间、解锁正文、审核意见 | 刷新、允许时取消/删除、另写新胶囊 | whispers API |
| pages/resources/index | 分类、搜索、资料标题/摘要、反馈/浏览统计、资格门禁 | 分类筛选、查询/重置、详情、贡献入口、分页 | ResourceContribution、ContentStats、resources API |
| pages/resources/detail | 资料说明、分类、更新时间、文件和反馈、下载中/已保存 | 收藏、下载、复制链接、微信转发、反馈、重试 | resources/resource-file API、FavoriteButton |
| pages/profile/index | 登录资料、头像/认证、处罚/审核提示、本人入口、消息未读、主题 | 我的心愿/应愿/收藏/消息/树洞/胶囊、设置、认证、切主题、退出 | AppPage、ProfileAvatar、AppIcon、用户store |
| pages/whispers/settings | 当前昵称与候选、本人暖评各状态、匿名偏好 | 设置昵称、昵称/评论切换、评论编辑/撤回、分页 | whispers API |
| pages/matchmaking/index | 活动标题/说明、阶段、报名/成功配对数量、天数、空态/门禁 | 查看活动、个人资料、翻页 | MatchmakingActivitySummary、matchmaking API |
| pages/matchmaking/profile | 共享身份信息、个人年龄/身高/体重、期待范围、校区/MBTI多选、个人/理想型特质、介绍/微信、自动保存与未知结果 | 修改共享资料、编辑偏好、推荐/自定义新增/移除特质、保存、重读、回活动 | MatchmakingForm、MatchmakingTraits、useMatchmakingProfile |
| pages/matchmaking/detail | 活动五个时间点、报名快照/审核、配对状态/对方资料/分数、任务按日解锁、退出理由 | 同意资料展示/报名、更新报名、退出、聊天、任务查看、原请求重试 | MatchmakingProfile、MatchmakingActivitySummary、useMatchmakingPage；matchmaking API |
| pages/favorites/index | 心愿/树洞/资料收藏、可用/失效引用、摘要 | 分类切换、查看、移除、分页/重试 | interactions API、FavoriteButton |


## 新版设计与关闭标准

本清单记录开发起点的现有能力；新增设计、三步顺序、分类协议及样板关闭标准统一见[两端页面与组件设计](client-experience-v1.md)。清单内每个路由在全面落地阶段逐项核对字段、操作、状态与真实接口，不以页面加载代替业务验收。
