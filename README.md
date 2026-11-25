# 鲤源池文档

这里维护当前模块依据、三端现状、开放问题和后续安排。更新日期：2026-11-17。

## 三端工作入口

| 端 | 现状 | 缺陷与缺口 | 后续计划 |
| --- | --- | --- | --- |
| Go后端 | [已实现模块与验证边界](development/backend/README.md) | [后端问题](development/backend/defects.md) | [后端安排](development/backend/plan.md) |
| Web管理端 | [页面与权限范围](development/admin/README.md) | [管理端问题](development/admin/defects.md) | [管理端安排](development/admin/plan.md) |
| 微信小程序 | [页面与链路范围](development/miniprogram/README.md) | [小程序问题](development/miniprogram/defects.md) | [小程序安排](development/miniprogram/plan.md) |

三端每端仅维护以上三份滚动文档，按模块组织；不再新增里程碑、提交补证、测试原始日志或截图目录。已实现与已验收分开描述，已修复缺陷不继续作为待开发项。

## 共享依据

- [2026-11-25 两端体验改进方案](design/client-improvements-2026-11-25/README.md)及[可点击原型](design/client-improvements-2026-11-25/index.html)，涵盖小程序资料、认证续办、通知、悄悄话，以及管理端导航、搜索、分页和两端文案。
- [两端交互原型 v2](design/prototypes-v2/index.html)：按上次已提交代码的素材与风格重新设计；包含小程序、管理端和[开发参考说明](design/prototypes-v2/README.md)，可离线查看。
- [新版设计查看入口](design/client-design-index-v1.html)：首批六样板、小程序页面族和管理端完整代表的独立HTML参考。
- [新版两端页面设计](design/client-experience-v1.md)：页面功能清单、实际组件样板及平台对照标准。
- [模块总览](modules.md)：按认证、心愿、聊天、树洞、用户、资料、安全和隐私定位有效需求、设计与契约。
- [跨端后续安排](plans/README.md)：依赖顺序、协作方、完成标准；具体事项只在所属端维护。
- [有效契约入口](contracts/README.md)：当前版本、增量关系与校验命令。
- [原始输入](requirements/original.md)、[基础需求](requirements/baseline.md)、[审批记录](approvals/README.md)：保留原始需求与授权依据；后续范围见模块总览所列增量。
- [架构](design/architecture.md)、[数据库设计](design/database.md)、[安全](design/security.md)、[性能要求](design/performance.md)：固定设计依据，制定时实现状态不代表今天的交付状态。
- [文档规则](governance/README.md)与[协作规则](AGENTS.md)。

## 当前结论

本轮按已提交的[原型 v2](design/prototypes-v2/README.md)落地两端界面，保留原素材与既有业务边界，补齐身份历史只读接口及失败恢复，并进行本地API、浏览器和微信开发环境验证。三端源码及文档增量已按模块归档至各自develop，尚未推送；主仓库main记录对应子模块引用；2026-11-17已停止本地预览服务，将后端和管理端部署至kurous.cn，并上传微信开发版1.0.34-ui.20261117。迁移使用连续0001–0033；完整基线SHA、制品指纹、实际验证和未覆盖状态分别记入三端现状。此前已提交的全仓维护见[全仓审核](reviews/full-code-review-2026-11-13.md)，不与本轮交付状态混用。

认证、心愿互动/图片、聊天还愿、悄悄鲤/胶囊、包分配、用户/资料和后台治理已有实现。固定设计与契约描述协议依据；真实供应商全场景、手机全模块、正式岗位、独立恢复与目标容量依照各端缺口单独验收。

## 历史与检查

重复阶段材料、旧计划、原始证据和过时草案已从当前目录移除，不另建归档目录。历史保存在 [整理前已推送快照](https://github.com/calm195/docs/tree/781d177221efdb9e955956343c4f2ceda8494eff)，删除去向由[历史清单](governance/retired.json)登记。固定需求/设计/契约中残留的历史链接按该快照追溯；当前文档必须链接当前文件或明确的Git历史地址。

```sh
python3 scripts/check_documents.py
python3 -m unittest discover -s scripts -p 'test_*.py'
python3 scripts/check_gate.py G1
python3 scripts/check_gate.py G2
python3 scripts/check_gate.py G3
# 首次准备契约检查环境
python3 -m venv .venv
.venv/bin/python -m pip install -r scripts/requirements.txt
.venv/bin/python scripts/check_contracts.py
```

检查不签发审批或业务验收。仓库只保留develop/main，日常修改在develop；提交、合并和推送遵循当次授权。
