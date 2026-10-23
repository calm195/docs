# 管理端按模块提交精确关联补充

2026-10-23（Asia/Shanghai），用户在T028开发中明确授权“按模块与依赖提交推送”。本记录关联T010/T012/T017/T028，适用REQ-002、REQ-014、REQ-015、REQ-016、REQ-018、REQ-019；不新增需求或改变审批。

## 精确源码提交

源码分支develop，原基点`cc0193bba6de30d1a8be0c08c8852a94ea62b3fd`；先迁移身份及内容模块，再清除共享运行时演示，继而安全治理客户端，最后页面与权限。

| 完整提交 | 模块与变更 |
| --- | --- |
| `c913b944304c135cf6f2e6d67419fddfe086dc88` | feat(identity): 完善真实身份审核接线与冲突处理 |
| `ee0fe9d4249f8c67f40a1ccd01d421e53325d844` | feat(content): 接入真实内容审核和词库管理接口 |
| `d6e18d1b41e973cd205a3fbe45ee9ea0ec53d2b4` | refactor(admin): 移除运行时演示并统一真实后台入口 |
| `5f58fb87c57b3230d50fa0cacd1a20783e8723c5` | feat(safety-api): 接入举报处罚申诉及内容处置协议 |
| `fcf894149de1e27966cc45833c7ceff743da5b3a` | feat(safety): 实现举报处罚申诉管理与多角色入口 |

最终源码`fcf894149de1e27966cc45833c7ceff743da5b3a`，提交后工作区干净。提交不代表验证通过：用户此前要求无需验证，最终改动仅执行格式化，没有运行check/build或实际联调。T012较早真实HTTP与测试只对应当时指纹，不追认本轮最终源码。

docs分支admin-develop，基点`3d1d1f395128d8bb0d1a1bc692b04095eea3f12e`，独立于backend-develop工作区；源码先提交，再将上述精确提交关联到本补充和T028新阶段，最后提交docs。推送只面向用户指定develop/admin-develop；未推送main、合并或部署。具体推送结果以执行输出及交接回报为准，不提前宣称已推送。

## 固定历史关联

以下记录中的“未授权/未提交”描述保留当时事实，本补充记录后续授权与精确提交，不修改原内容或指纹：

- [2026-10-23-identity-integration-r1.md](2026-10-23-identity-integration-r1.md)：SHA-256 `c41c03e514484d74e8213d0c4e5ab13be2758d48e5f7576063fff705d1b95646`。
- [2026-10-23-content-api-only-r1.md](2026-10-23-content-api-only-r1.md)：SHA-256 `af3d98d2fb11bcd447ef50ae06c52814aa7c3071d48ee0d0040d1f64e94a75cd`。
- [2026-10-23-moderation-outcome-gap-r1.md](2026-10-23-moderation-outcome-gap-r1.md)：SHA-256 `f8544376c3311b332db446f54b057b960299f2ee38d904dafc04404993f58bc1`。

T028当前实现与账号/内容资源版本交接依赖见[安全治理阶段](2026-10-23-safety-management-r1.md)。治理清单仅追加本轮记录；既有后端和前端固定条目、需求与契约不改写。未执行本轮docs链接/固定指纹检查，不能声称文档检查通过。
