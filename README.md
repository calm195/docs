# 鲤源池文档

这里维护当前模块依据、三端现状、开放问题和后续安排。更新日期：2026-10-30。

## 三端工作入口

| 端 | 现状 | 缺陷与缺口 | 后续计划 |
| --- | --- | --- | --- |
| Go后端 | [已实现模块与验证边界](development/backend/README.md) | [后端问题](development/backend/defects.md) | [后端安排](development/backend/plan.md) |
| Web管理端 | [页面与权限范围](development/admin/README.md) | [管理端问题](development/admin/defects.md) | [管理端安排](development/admin/plan.md) |
| 微信小程序 | [页面与链路范围](development/miniprogram/README.md) | [小程序问题](development/miniprogram/defects.md) | [小程序安排](development/miniprogram/plan.md) |

三端每端仅维护以上三份滚动文档，按模块组织；不再新增里程碑、提交补证、测试原始日志或截图目录。已实现与已验收分开描述，已修复缺陷不继续作为待开发项。

## 共享依据

- [模块总览](modules.md)：按认证、心愿、聊天、树洞、用户、资料、安全和隐私定位有效需求、设计与契约。
- [跨端后续安排](plans/README.md)：依赖顺序、协作方、完成标准；具体事项只在所属端维护。
- [有效契约入口](contracts/README.md)：当前版本、增量关系与校验命令。
- [原始输入](requirements/original.md)、[基础需求](requirements/baseline.md)、[审批记录](approvals/README.md)：保留原始需求与授权依据；后续范围见模块总览所列增量。
- [架构](design/architecture.md)、[数据库设计](design/database.md)、[安全](design/security.md)、[性能要求](design/performance.md)：固定设计依据，制定时实现状态不代表今天的交付状态。
- [文档规则](governance/README.md)与[协作规则](AGENTS.md)。

## 当前结论

认证、心愿/匹配/聊天、还愿、悄悄鲤、用户管理、资料广场与后台治理已有实现和不同范围验证。尚未完成统一的正式供应商、全模块手机真机、全副本清理/独立恢复及容量验收；详细差距以三端缺陷表为准。现有接口或构建通过不等于生产可用。

## 历史与检查

重复阶段材料、旧计划、原始证据和过时草案已从当前目录移除，不另建归档目录。历史保存在 [整理前已推送快照](https://github.com/calm195/docs/tree/781d177221efdb9e955956343c4f2ceda8494eff)，删除去向由[历史清单](governance/retired.json)登记。固定需求/设计/契约中残留的历史链接按该快照追溯；当前文档必须链接当前文件或明确的Git历史地址。

```sh
python3 scripts/check_documents.py
python3 -m unittest discover -s scripts -p 'test_*.py'
python3 scripts/check_gate.py G1
python3 scripts/check_gate.py G2
python3 scripts/check_gate.py G3
# 在安装了契约依赖的独立Python环境中执行
python3 scripts/check_contracts.py
```

检查不签发审批或业务验收。仓库只保留develop/main，日常修改在develop；提交、合并和推送遵循当次授权。
