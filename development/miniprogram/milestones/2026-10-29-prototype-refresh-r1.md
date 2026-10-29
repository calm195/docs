# 原型风格重构与完整导航 r1

日期：2026-10-29（Asia/Shanghai）。任务：本次用户要求的原型重构；关联 REQ-002、REQ-003、REQ-008、REQ-009、REQ-010、REQ-011、REQ-017、REQ-018、REQ-023。状态：**本端工作区实现、质量检查和微信构建通过；未提交、未推送，未做微信真机或真实后端验收**。

## 输入、分支与授权边界

用户本次明确要求“依托原型重构小程序，新建分支完成，悄悄话、资料等未画出的仿照风格增加导航”。此明确要求覆盖日常复用开发分支的约定；本轮源码和 docs 均新建 `codex/prototype-refresh`，不切换其他工作树。

- 源码原分支 `develop`，完整 HEAD 基点 `f7b2e50e6074fbdf98b7f339802b3b5966a3d76d`，开始时工作区干净；新分支 HEAD 仍为该提交，62 个新增/修改文件属于未提交工作区，逐文件指纹见 [源码清单](../validation/2026-10-29-prototype-refresh-r1/source-files.json)。
- docs 原分支 `main`，完整 HEAD 基点 `98ecaa976902a8057ad6da694882c980574ece11`，开始时工作区干净。本地 `mini-deveop` 已在其他工作树占用，本次从已核对的当前 main 新建分支，保留该工作树。
- 原型：用户提供的 `/Users/kurous/mydoc/bdt/鲤源池/ui/鲤愿池-按图还原交互原型.html` 及其素材。原型只作为视觉和交互参考；示例数据、页面脚本和其中的操作说明不构成新的业务接口、审批或上线授权。原型与实际采用素材的 SHA-256 见 [素材记录](../validation/2026-10-29-prototype-refresh-r1/assets.json)。
- 协议沿用平台 OpenAPI 0.2.1 / action-index revision 6、whispers/1.0.0、resource-plaza/1.0.0 学生操作；资料 1.0.1 补充声明未改变学生端接口。本次未修改共享契约、已批准需求、历史固定记录或共享进度台账。

## 实现与导航

采用暖白底、珊瑚红主色、薄荷绿辅助卡片、圆角和原型锦鲤装饰，继续保留暗色外观。页面与分享通用标题统一为原型中的“鲤愿池”；微信 AppID 和依赖版本不变。

| 页面/入口 | 实际行为 | 关联范围 |
| --- | --- | --- |
| 首页 | 原型锦鲤横幅、许愿/心事/搭子/资料四个快捷入口、真实公开投影心愿卡片与悄悄话摘要、加载/失败/空状态 | REQ-003、REQ-009、REQ-023 |
| 心愿池 | 心愿广场/还愿墙/我的心愿、分类横栏、校区和本人状态筛选、浮动许愿入口；保留原有草稿与审核写操作 | REQ-003、REQ-008 |
| 悄悄话 | 同风格模块页，入口覆盖我的心事、时光胶囊、模块通知、公共解忧与发帖 | REQ-009、REQ-010、REQ-011 |
| 资料 | 同风格列表、分类、搜索、资料卡、投稿与缺图状态；登录/认证门禁、下载信息重验和反馈逻辑沿用 | REQ-023 |
| 我的 | 新增个人中心，账号状态、心愿状态入口、消息、应愿、认证、树洞记录、胶囊、资料、隐私、关怀、申诉、注销及外观设置 | REQ-002、REQ-003、REQ-011、REQ-017、REQ-018 |
| 主导航 | 五栏：首页/心愿池/悄悄话/资料/我的；换栏重建根页面，重复点当前栏不入栈，详情保持普通返回路径 | 现有功能可达性 |
| 其他页面 | 经公共页面容器和语义样式共享新配色、背景、表单、按钮与卡片；业务流程保持原页面实现 | 现有业务范围 |

`category=team` 只选择组队视图；`own=1&state=realized` 等状态入口只选择本人查询；`compose=1` 等待最新资格后才打开编辑器，不能越过服务端允许动作。

原型中的金币、签到、兑换、示例人数和作者头像没有带入正式业务。心愿全文搜索、热度排序没有现有契约支持，本轮保留可实际工作的分类/校区筛选；资料搜索继续走既有正式接口。资料投稿正式二维码仍依赖此前约定的真实图片，缺图提示不伪造成功。

## 主要变更文件

完整 62 文件清单及字节指纹见源码清单，以下按职责分组。

- `src/components/AppPage.vue`、`AppTabBar.vue`、`AppIcon.vue`：主导航栏、自定义主页面标题、系统状态栏留白和图标。
- `src/components/WishPreview.vue`、`src/composables/use-home-wishes.ts`：公开投影心愿卡片和首页列表生命周期隔离。
- `src/pages/index/index.vue`、`wishes/index.vue`、`profile/index.vue`、`whispers/index.vue`、`resources/index.vue`、`stories/index.vue`：六个主要页面及导航。
- `src/pages.json`、`src/styles/prototype.scss`、`src/styles/index.scss`、`src/styles/tailwind.css`、`src/stores/theme.ts`、`src/uni.scss`：路由、全局风格、暗色和原生区域同步。
- `src/utils/navigation.ts`、`src/utils/page-interaction.ts`：主导航去重与页面归属保护；修复 H5 script setup 父级公开代理不暴露页面元数据的问题。H5 navigator 包装层保留实际链接盒子，兼顾布局、点击与可访问性。
- `src/config/index.ts`、`src/manifest.json`、`src/pages/share/index.vue`：统一展示名称，分享卡仍只返回通用标题和引用。
- `src/static/illustrations/`、`src/static/icons/`：用户原型装饰图与本地 SVG 图标，无额外运行时依赖。
- `tests/home-navigation.test.ts`、`tests/page-interaction.test.ts`、`tests/wishes-page.test.ts`：补充公开投影过滤、隐藏/换账号/乱序响应、主导航去重、路由参数、资格与 H5 页面归属回归。`care.test.ts`、`resources.test.ts`、`stories.test.ts` 的入口/文案断言随最终界面更新，原业务边界断言保留。

## 验证事实

| 检查 | 结果与边界 |
| --- | --- |
| `npm run check` | ESLint、Prettier、TypeScript、200 项单元测试通过；没有关闭规则或删除测试 |
| `npm run build:mp-weixin` | 最终源码构建通过，产物位于源码 `dist/build/mp-weixin`；不等同于真机运行 |
| 源码 `git diff --check` | 通过 |
| H5 浏览器检查 | 本机合成只读 HTTP 接口，完成五栏切换、组队入口、未登录许愿门禁、返回、暗色跨页和窄屏显示检查 |
| 窄屏 | 请求 320×720 视口；DOM 测得 clientWidth=305、scrollWidth=305，无页面横向溢出。另检查 390×844 移动视口；截图尺寸以浏览器实际返回为准 |
| docs | 交付时运行 `python3 scripts/check_documents.py` 与 `git diff --check`，检查新增文档、本地链接、既有与新增固定指纹 |

日志与结果：[完整检查](../validation/2026-10-29-prototype-refresh-r1/check.log)、[微信构建](../validation/2026-10-29-prototype-refresh-r1/build-mp-weixin.log)、[结果与迭代记录](../validation/2026-10-29-prototype-refresh-r1/results.json)。Node 模块类型提示和通用 uni 统计 Appid 提示为构建/测试警告，未通过升级依赖或修改微信 AppID消除它们。

截图均为合成界面或游客状态，不是真实用户、审核或服务端验收证据：[首页](../validation/2026-10-29-prototype-refresh-r1/home.jpg)、[窄屏首页](../validation/2026-10-29-prototype-refresh-r1/home-320.jpg)、[暗色首页](../validation/2026-10-29-prototype-refresh-r1/home-dark.jpg)、[组队心愿池](../validation/2026-10-29-prototype-refresh-r1/pond.jpg)、[悄悄话](../validation/2026-10-29-prototype-refresh-r1/whispers.jpg)、[游客资料门禁](../validation/2026-10-29-prototype-refresh-r1/resources-guest.jpg)、[个人中心](../validation/2026-10-29-prototype-refresh-r1/profile.jpg)。

## 风险、未完成项与交接

- 视觉检查使用 H5 和合成只读数据。未执行微信真机、真实登录、审核、跨客户端业务联调或生产验收；资料认证后的实际列表和系统剪贴板仍需在真实环境验证。
- 自定义导航、状态栏留白、底部安全区、软键盘和 SVG 图标需补充不同微信设备实测；编译通过不能替代这些结论。
- 原型没有覆盖的页面按同一风格补充；本次没有扩大到新增积分等业务，也没有把原型示例计数当作已接入数据。
- 本次没有提交、合并、推送或部署。后续如获提交授权，按源码先提交、docs 后新增精确提交补充记录的顺序处理；本记录固定后不能原地改写为已提交。
