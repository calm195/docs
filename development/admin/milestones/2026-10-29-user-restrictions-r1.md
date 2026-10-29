# 用户页直接封禁与禁言交付 r1

日期：2026-10-29（Asia/Shanghai）；关联 UM-A01–A06 增量、REQ-022-I/J/K/L、REQ-016、REQ-018、REQ-019。

【事实】用户明确选择“直接管理（推荐）：填写理由后执行，新增后端接口与契约”。管理端与后端工作区实现和本次检查通过；未提交、推送或部署，未操作既有开发业务账号，不代表三端真实验收。新需求、设计和契约见[需求v1.2](../../../requirements/admin-users-v1.2.md)、[设计](../../../design/admin-user-restrictions-v1.md)、[user-restrictions/1.0.0](../../../contracts/user-restrictions-v1/README.md)。

## 基点与补充关系

- 管理端源码：`develop` / `69f07a2af4c84b4da8026c636c7a06463491f548`。此HEAD为实现前基点，新增源码仍未提交；[文件指纹](../validation/2026-10-29-user-restrictions-workspace-r1.json)覆盖此前UM-A01–A06及本次增量的完整工作区。
- 后端：`develop` / `ca9f68ac51285dafee88431d7610d9856e394985` 加未提交修改；[后端交付](../../backend/milestones/2026-10-29-user-restrictions-r1.md)。
- docs：独立工作树 `docs-admin-develop` 的 `admin-develop` / `3412a7549e69bd38125e1a7dd401a743adcbe309`。沿用本任务已完成的安全快进；本次跨端任务按治理规范共用该docs分支，各端记录分别归档；不切换或修改主docs工作树的backend-develop及其在途修改。
- 补充[原UM-A01–A06交付](2026-10-29-admin-users-implementation-r1.md)，原文件SHA-256为 `26e20b967f090e1986e71c3718d6895b5b7b72a1688a846c21d6c00536742b67`。原“用户页只查询和导航”是当时范围；本次用户明确变更后增加直接操作，原固定记录、指纹及验收边界保持原样。
- 原admin-users/1.0.0只读查询契约不变；四个写动作使用新独立模块，不扩展旧查询allowed_actions枚举。

## 用户可见行为与文件

- 用户详情内新增 `UserRestrictionActions.vue`：super_admin 可封禁/解封、禁言/取消禁言，理由必填，去空白后UTF-8不超过2000字节，先刷新账号版本再二次确认。
- 封禁持续至解除；禁言固定168小时。两种限制可并存；解封撤销所有当前有效封禁，取消禁言撤销所有当前有效禁言；保留另一类型、危机隔离和隐私屏障，已取消的互动及已下线内容不复活。
- `types/users.ts`、`services/users.ts`提供独立状态及四个显式POST；严格校验unknown响应、动作/布尔状态/目标对应关系，不从旧“封禁优先”摘要推断禁言不存在。
- `UsersView.vue`、`useUsers.ts`在成功后重新读取列表、详情和历史。刷新保持抽屉打开，用户关闭后晚到结果不得重新打开；403使工作区失效，404清空不可用目标，409丢弃旧确认重新核对，网络结果不明确时保留同键同请求重试。
- `UserRestrictionActions.spec.ts`、`users.spec.ts`、`UsersView.spec.ts`及 `scripts/users-browser.spec.js`覆盖行为；README.md与README.en.md同步描述用法和迁移依赖。完整文件列表及内容SHA-256见工作区证据。

## 实际验证

| 检查 | 结果和证据 |
| --- | --- |
| pnpm format | 通过；[输出](../validation/2026-10-29-user-restrictions-format-r1.txt) |
| pnpm check | 36个应用测试文件、578个应用测试、58个规则测试通过，含格式、lint、严格类型检查；[输出](../validation/2026-10-29-user-restrictions-check-r1.txt) |
| pnpm build | 通过；[输出](../validation/2026-10-29-user-restrictions-build-r1.txt) |
| pnpm test:browser:users | 本机Chrome、实际Vue页面，HTTP为合成拦截；三角色、双主题、1440/390px，共25张截图，包含四个动作与成功后再次确认；[输出](../validation/2026-10-29-user-restrictions-browser-r1.txt)、[结果](../validation/2026-10-29-user-restrictions-browser-r1/result.json)、[直接操作截图](../validation/2026-10-29-user-restrictions-browser-r1/direct-actions.png) |
| 后端真实HTTP/SQL隔离验证 | 四动作、版本、角色、同键重放、并发、直接申诉和注销屏障通过；详见[后端记录](../../backend/milestones/2026-10-29-user-restrictions-r1.md) |

抽屉问题在最终浏览器检查中暴露并修复；早期合成响应误将“封禁优先”摘要保留muted_until，严格解析正确拒绝，修正测试夹具后重跑通过。以上均为修复后的结果。原树洞浏览器回归沿用原交付事实，本次未重跑并不计为本次新证据。

## 依赖与未完成项

既有运行后端尚未应用0028及加载新代码；需要先显式迁移、重启后端新构建，再启用管理端新构建。此次未更改正在使用的开发业务库。完整管理端浏览器到真实后端、通知外部供应商、小程序受限体验及生产验收未执行；浏览器合成通过不能替代这些验证。源码和文档未获单独提交授权，后续若提交以新的补充记录关联精确源码提交，不改本固定记录。
