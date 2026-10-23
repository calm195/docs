# 证据删除处理与回执查询独立页面 r1

日期：2026-10-23（Asia/Shanghai）。用户授权继续本次重构，按模块与依赖顺序在测试修复通过后提交，并同步 docs。关联 REQ-018、REQ-019、REQ-020，不新增业务需求、不变更批准语义，不签发 G1/G2/G3 或人工验收。

## 基点与精确交付

沿用本次重构分支 `codex/admin-navigation-theme`，两仓库开始时干净；不切换其他任务占用的 docs `admin-develop` 工作树。源码基点 `cb0331380fd943ab8f919a2269b16342279aff05`，docs 基点 `909e5b59a911c9efc7bdb526fd69e8319b1b839d`。先提交源码 `e624ba174dc81548534c59ae94b7c829d97cd7c0`，再登记本次文档。依赖已交付统一布局、面包屑及 Element Plus 深浅主题。共享契约 `0.2.0 revision 5` 不变；后端、契约和依赖未修改。未推送、合并、部署或上线。

## 实现、取舍与可测试验收

- 保留 /evidence-deletion 作为“证据删除”，新增懒加载 /deletion-receipts“回执查询”，各有菜单、标题和隐私管理面包屑，均仅超管可见/可进入。统一布局和深浅主题沿用。
- 删除页仅按已知证据 ID 读取只读元信息；后台无证据列表，不制造本地列表或敏感正文/学号。显式点击“处理证据删除”才在 Element Plus 抽屉填写理由、核对范围与最终确认，仍按证据范围版本提交，不能用案件版本代替。
- 理由保留原文、UTF-8 2000字节限制和幂等键；同输入网络失败可手动重试，不自动重提。404/409清旧目标与理由要求重新读取；401/403/撤权/离页清理和取消请求，晚到受理不恢复旧材料。打开抽屉锁定查询/清空；提交禁止取消/关闭；取消保留当前元信息但清理由、确认、幂等尝试。理由变化撤销旧确认。
- 删除受理只展示待办 ID、版本与“尚未确认清理完成”，提供前往独立回执页链接。为了保持两个页面的内存边界，待办 ID 由操作人员输入查询，不自动查询、不把完整回执交给路由或共享持久状态。离页清空旧理由与目标。
- 回执查询页独立 useDeletionReceipts 状态，支持后台待办 ID 和本人主动提供的完整匿名回执；保留密码输入、完整格式校验、匿名查询不携带后台令牌的既有服务协议。页面不会触发删除；查询进度与后端确认完成分开，404不声称已完成，网络读取错误不显示写入不明确。编辑查询撤下旧结果，清空/离页/会话失效清除完整回执。未修改现有服务端回执路径协议。
- 将写入与查询状态分别提取 useEvidenceDeletion 和 useDeletionReceipts，不增加依赖和后端接口。README中英文同步用途与页面说明。
- 原有14项测试保留并适配页面切换/显式处理，新增只读元信息、取消保留目标、写入关闭保护、离页迟到受理、离页回执清理；隐私测试17项通过。路由增加未登录、危机角色、超管、审核角色及独立标题/分组覆盖。测试新增 RouterLink 使用标准类型化桩；首次未注入路由导致的测试失败已修复，全量重新运行通过。


## 实际验证与边界

实际执行 `pnpm format`、`pnpm check`、`pnpm build` 全部通过：27个业务测试文件、336项业务测试、58项规范测试；格式、零警告 lint 与严格 TypeScript 通过。源码 `git diff --check` 通过。docs 交付运行 `python3 scripts/check_documents.py`（含固定指纹与链接）和 `git diff --check`。没有关闭规则或删除原有回归。

复用5173/18080与用户手动填写的登录会话，核对“证据删除”“回执查询”独立菜单、面包屑和深浅主题并各保存两张空输入截图。使用合成 UUID 11111111-1111-4111-8111-111111111111 执行只读证据元信息、待办查询，分别得到不存在/不可访问与不能认定清理完成提示；输入非完整回执字符串验证禁用查询，随后清空所有测试输入。没有使用真实匿名回执，没有读取正文/学号，没有打开真实删除操作或发送 DELETE。未读取口令或保存令牌。真实证据详情、真实受理及清理闭环仍未验证。


详情、处理、异常与迟到响应采用模拟服务和合成会话验证，不能替代真实业务闭环。窄屏人工焦点/滚动、真实低权限账号未验证。离页拒绝迟到响应不保证撤销已发送的服务端请求。本轮没有作出真实危机处置或永久删除。

## 变更文件与证据

源码变更：`README.en.md`, `README.md`, `src/composables/useDeletionReceipts.ts`, `src/composables/useEvidenceDeletion.ts`, `src/router/index.spec.ts`, `src/router/index.ts`, `src/views/DeletionReceiptsView.vue`, `src/views/EvidenceDeletionView.spec.ts`, `src/views/EvidenceDeletionView.vue`。

- [质量检查实际日志](../validation/2026-10-23-privacy-pages-quality-r1.txt)
- [源码与截图指纹](../validation/2026-10-23-privacy-pages-r1.json)
- [截图 2026-10-23-privacy-pages-evidence-dark-r1](../validation/2026-10-23-privacy-pages-evidence-dark-r1.png)
- [截图 2026-10-23-privacy-pages-evidence-light-r1](../validation/2026-10-23-privacy-pages-evidence-light-r1.png)
- [截图 2026-10-23-privacy-pages-receipts-dark-r1](../validation/2026-10-23-privacy-pages-receipts-dark-r1.png)
- [截图 2026-10-23-privacy-pages-receipts-light-r1](../validation/2026-10-23-privacy-pages-receipts-light-r1.png)
