# 平台用户管理 UM-A01–A06 本端交付 r1

日期：2026-10-29（Asia/Shanghai）。关联 UM-03、UM-A01–A06、REQ-022、REQ-016、REQ-018、REQ-019、REQ-021。

【状态】管理端工作区实现与本端验证通过；尚未提交源码或 docs，没有推送、发布、部署或业务验收。本轮用户授权为按计划开发、同步 admin-develop、测试与交付文档；源码提交未获单独授权。本记录按治理规范记载精确 HEAD 基点、未提交状态及文件指纹，不能把基点写成包含本次实现的源码提交。

## 基点与安全同步

- 源码：`develop` / `69f07a2af4c84b4da8026c636c7a06463491f548`，开始时干净，本次实现为其上未提交修改。
- docs：独立工作树 `/Users/kurous/code/liyuanci/docs-admin-develop`，分支 `admin-develop`；从干净的 `ebbd8aaf16d56befb63e4cb3e8f2899029823e47` 以 `git merge --ff-only` 快进到 `3412a7549e69bd38125e1a7dd401a743adcbe309`。祖先检查通过，无合并提交、无重置。
- 开始时主 docs 工作树位于 `backend-develop`，含后端记录与固定清单在途修改；本轮不切换、不修改该工作树。端内索引及固定清单仅在独立 admin-develop 工作树追加。
- 输入：[工作包](2026-10-29-admin-users-development-r1.md)、[契约 admin-users/1.0.0](../../../contracts/admin-users-v1/README.md)、[规范语义](../../../contracts/admin-users-v1/semantics.md)、[联调矩阵](../../../design/admin-users-delivery-v1.md)。原普通处罚/申诉沿用全站0.2.1，树洞沿用whispers/1.0.0，不改固定契约。
- 精确变更文件与 SHA-256、契约包 manifest 指纹见[工作区证据](../validation/2026-10-29-admin-users-workspace-r1.json)。源测试夹具与固定 examples.json 做 JSON 语义一致性比较通过（源码夹具按 Prettier 格式化）。

## 实现与验收映射

| 工作项 | 实现 | 本端可测试结果 |
| --- | --- | --- |
| UM-A01 / 022-A/C/G | 新增 users 类型及服务；三个GET独立解析、字段白名单、枚举/null/版本/目标ID、响应头与封装检查 | 全部契约正反夹具及成功样例通过；HTTP错误不伪装为空页，撤权后不发请求或不接收在途结果 |
| UM-A02 / 022-B/H | 用户管理 → 平台用户 `/users`；ID/昵称/认证/限制取交集；文本渲染、北京时间、服务端限制状态 | 重名逐行显示；准确White_Space裁剪、50/51 Unicode码点及特殊字符编码通过；浏览器昵称HTML不执行 |
| UM-A03 / 022-B/H | 草稿与已提交条件分离；列表游标栈；请求取消和当前请求校验 | 改条件禁用旧翻页；更词/limit清栈；上一页重取相同条件；晚到响应不覆盖新结果；不显示总数/总页数 |
| UM-A04 / 022-C/F/G | 详情抽屉、独立处罚历史分页；安全摘要与授权链接；空/失败/失效反馈 | A详情不污染B；历史503不遮掉有效详情；404清空详情并刷新列表；退出/换号/撤权清空资料；有效处罚摘要为空不覆盖全局限制 |
| UM-A05 / 022-D/E | 跨页面内存目标约束；处罚核对前重读举报并校验作者/案件/内容版本，再读取account_version；申诉ID适配 | 作者不一致阻止操作；账号查询失败或案件换版不生成确认；409重新读取后再次确认；网络不明结果保留同键同请求；申诉用Appeal.version；返回用户页重读详情与历史 |
| UM-A06 / 022-A–H | 新增服务/页面行为测试、补充原工作台和菜单测试、新增用户浏览器脚本与中英文README | 完整质量检查、用户浏览器及既有树洞浏览器回归通过，证据如下 |

主要新增文件：`src/types/users.ts`、`src/services/users.ts`、`src/services/users.spec.ts`、`src/services/users.contract.spec.json`、`src/composables/useUsers.ts`、`src/stores/userNavigation.ts`、`src/views/UsersView.vue`、`src/views/UsersView.spec.ts`、`scripts/users-browser.spec.js`。主要适配：路由、AdminLayout、SafetyWorkspace、useSafety、useAdminWorkspace、对应测试、package.json 与双语README。完整列表以工作区证据为准。

## 实现取舍与边界

- 列表与详情/历史使用独立取消控制器，外层仍绑定进入页面时的管理员会话；403使当前工作区失效，防止未离页期间再次读取。该共用边界通过全站测试及既有浏览器回归验证。
- 跨案件页面只保留内存中的用户ID目标约束，不持久化昵称或详情；进入其他业务路径或会话/权限变动时清理。返回用户页重新获取资料，不复用旧版本。
- 用户页只有查询和授权导航。普通举报进入原处罚页，普通审核来源进入审核工作台按ID选择，不假设旧页支持新参数。申诉链接提供ID选择并重新鉴权读取。普通处罚不再提供人工账号版本输入。
- 限制状态直接消费服务端restriction/as_of，不根据空历史、本机时间或单条撤销推断已全量解罚。用户页不关联树洞或危机来源，不展示自由理由原文。
- 运行时始终使用真实同源服务，没有失败自动Mock。合成夹具仅在单元测试和浏览器请求拦截层使用；不承诺实际数据库搜索命中、鉴权、日志屏蔽或处置生效。

## 实际验证

| 检查 | 本轮结果与证据 |
| --- | --- |
| `pnpm format` | 通过；[格式化输出](../validation/2026-10-29-admin-users-format-r1.txt) |
| `pnpm check` | 通过；35个应用测试文件、562个应用测试、58个规则测试；包含format:check/lint/typecheck；[完整输出](../validation/2026-10-29-admin-users-check-r1.txt) |
| `pnpm build` | 通过，类型检查和Vite构建成功；[完整输出](../validation/2026-10-29-admin-users-build-r1.txt) |
| `pnpm test:browser:users` | 本机Chrome、实际Vue页面/路由/解析器、全部业务HTTP被合成传输拦截；三角色×双主题×桌面/390px，24张截图；查询编码、分页、503、退出清理和昵称不持久化通过；[结果](../validation/2026-10-29-admin-users-browser-r1/result.json) |
| `pnpm test:browser` | 既有树洞4页面双主题、桌面/窄屏/抽屉、三角色、适配器提交与会话清理通过；24张截图；[结果](../validation/2026-10-29-admin-users-whispers-regression-r1/browser-results.json) |
| 文档及固定指纹 | 独立docs工作树运行 `python3 scripts/check_documents.py`；源码/docs运行 `git diff --check`，结果见交付回复 |

浏览器使用本轮独立Vite端口5175，已有Playwright及Chrome，无新增依赖或lockfile改动。实际启动时受sandbox监听限制，通过受控权限启动本机进程后完成回归。初次检查修正了类型/格式、旧文案断言、新菜单组遗漏；浏览器截图改为等待关闭并禁用截图动画，避免过渡态截图。最终结果以以上本轮输出为准，不沿用旧快照。

视觉复核了浅色窄屏列表、深色窄屏详情及桌面详情；窄屏表格保持可横向滚动，抽屉可滚动。代表截图：[窄屏列表](../validation/2026-10-29-admin-users-browser-r1/super_admin-light-390-list.png)、[窄屏详情](../validation/2026-10-29-admin-users-browser-r1/super_admin-dark-390-detail.png)。

## 尚未完成与依赖

【事实】本轮未访问真实用户查询后端，未执行真实处罚/申诉、数据库/注销并发、真实性能测试、网关/APM/SQL日志核验、微信真机或生产操作；后端当前实现状态需以其新交付证据核对。固定包的not-implemented属于设计交付时快照，不据此断言当前后端不可用。

【后续】UM-I01–I11须在后端SHA、同包指纹、隔离账号/样本、日志屏蔽与清理责任明确后逐项验证。新增查询不可用将阻塞用户查询和依赖account_version的普通处罚确认，页面显示明确失败。原树洞WA-05真实页面验收仍未关闭，本轮合成回归不替代它。源码与docs提交须在获得提交授权后按源码先、文档后执行；提交后另发补充记录关联精确实现提交，不改本固定记录。
