# 危机查询详情与处理抽屉分离 r1

日期：2026-10-23（Asia/Shanghai）。用户授权继续本次重构，按模块与依赖顺序在测试修复通过后提交，并同步 docs。关联 REQ-014、REQ-017、REQ-018、REQ-019、REQ-020，不新增业务需求、不变更批准语义，不签发 G1/G2/G3 或人工验收。

## 基点与精确交付

沿用本次重构分支 `codex/admin-navigation-theme`，两仓库开始时干净；不切换其他任务占用的 docs `admin-develop` 工作树。源码基点 `d7dc5e44a02e93610115f3cd7a5a9ad18257e3fc`，docs 基点 `75be231d34dea812f59e43a1256823a5f74cbf06`。先提交源码 `cb0331380fd943ab8f919a2269b16342279aff05`，再登记本次文档。依赖已交付统一布局、面包屑及 Element Plus 深浅主题。共享契约 `0.2.0 revision 5` 不变；后端、契约和依赖未修改。未推送、合并、部署或上线。

## 实现、取舍与可测试验收

- 查询列表仅展示编号、状态和版本，选案后读取右侧只读授权详情、时间线与投递待办；详情不包含处置表单。学号仍显式显示，限定证据仍按案件引用按需读取。
- 显式点击“处理危机案件”打开 Element Plus 抽屉，收起学号与限定证据；接手、跟进、结案、通知重试、误报保留原语义，必填理由和二次确认。仅 pending_handling/handling 可处理，未知及终态只读。
- 抽屉打开时锁定查询刷新、分页、切案和详情关闭；提交时阻止取消与抽屉关闭。取消保留详情和游标并清理理由、动作、确认与幂等尝试。未提交不产生写入。
- useCrisisReview 提取请求与状态；当前版本提交、同输入失败幂等重试、409清旧操作重读且不自动重提、404清失效材料、401/403/撤权/离页清理沿用。补充挂载代次保护，离页后列表回调不会继续打开 URL 中指定案件。
- 保留 /crisis?case=技术编号交接，进入只读详情，不自动打开处理。统一布局、面包屑和主题样式沿用，无新路由和依赖。
- 原有16项测试保留适配显式打开；增加只读/取消清意见、隐藏材料、忙碌关闭保护与404清理，模块18项通过。误报不直接公开/送达，结案保留隔离，通知重试不代表送达或接手。


## 实际验证与边界

实际执行 `pnpm format`、`pnpm check`、`pnpm build` 全部通过：27个业务测试文件、329项业务测试、58项规范测试；格式、零警告 lint 与严格 TypeScript 通过。源码 `git diff --check` 通过。docs 交付运行 `python3 scripts/check_documents.py`（含固定指纹与链接）和 `git diff --check`。没有关闭规则或删除原有回归。

真实浏览器复用5173/18080与用户已登录会话，验证危机菜单、面包屑、查询刷新、浅色及深色显示，保存两张截图。当前真实危机列表为空，未读取真实敏感案件材料、未发送处置。未读取口令或保存令牌。


详情、处理、异常与迟到响应采用模拟服务和合成会话验证，不能替代真实业务闭环。窄屏人工焦点/滚动、真实低权限账号未验证。离页拒绝迟到响应不保证撤销已发送的服务端请求。本轮没有作出真实危机处置或永久删除。

## 变更文件与证据

源码变更：`README.en.md`, `README.md`, `src/composables/useCrisisReview.ts`, `src/views/CrisisView.spec.ts`, `src/views/CrisisView.vue`。

- [质量检查实际日志](../validation/2026-10-23-crisis-separation-quality-r1.txt)
- [源码与截图指纹](../validation/2026-10-23-crisis-separation-r1.json)
- [截图 2026-10-23-crisis-separation-dark-r1](../validation/2026-10-23-crisis-separation-dark-r1.png)
- [截图 2026-10-23-crisis-separation-light-r1](../validation/2026-10-23-crisis-separation-light-r1.png)
