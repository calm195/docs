# 资料广场契约勘误 resource-plaza/1.0.1

日期：2026-10-29。关联 REQ-023-R/T、REQ-018；用户本轮授权“调起subagent完成三端开发任务”。本版本修复实施中真实 HTTP 校验发现的错误响应声明漏项，属于原有隐私与幂等语义的一致性修正，不新增业务范围或批准结论。

## 修正及权威

原 [resource-plaza/1.0.0 语义](../resource-plaza-v1/semantics.md)要求成功幂等重放先检查当前可读性；当此前创建的资料已被 privacy 屏障隐藏，`POST /admin/resources` 同键重试必须返回 `404 NOT_FOUND`，不能恢复旧正文。原 OpenAPI 的 `adminResourceCreate` 遗漏了该响应，导致严格客户端把合法的隐私拒绝误认为未知响应。

本目录 [openapi.json](openapi.json) 是完整有效声明：相对旧版本仅更新版本号为1.0.1，并为 `adminResourceCreate` 增加404响应及 `x-error-codes.404 = [NOT_FOUND]`。其他14操作、全部39 schema、字段/权限/动作/版本/事务/固定二维码规则均不变；行为以原语义及本勘误共同解释。原全部固定文件与指纹保留。

继承原 [动作索引](../resource-plaza-v1/actions.json)、[规范语义](../resource-plaza-v1/semantics.md)、[正反夹具](../resource-plaza-v1/examples.json)、[文本和跨字段对照器](../resource-plaza-v1/rules.py)。原动作索引的1.0.0标识仅表示该文件原生成版本；本次操作ID、主体、动作映射完全相同。[补充错误样例](examples.json)增加创建成功后被隐藏的重放404，错误不带data。

## 三端接入

- 后端：保持按当前授权返回404；使用本完整OpenAPI校验实际HTTP捕获。
- 管理端：创建操作须识别404并清除当前创建/详情/输入及待重试状态，不换键重新创建，不保留旧正文；增加隐私重放拒绝用例。
- 小程序：五个学生操作及其schema字节内容未改变，已完成的1.0.0本端测试仍覆盖本版本学生接口，无需改变源码。真实联调采用本版本完整声明。

三端开发记录分别保存在各端独立docs工作树，记录当时消费版本和验证边界；本修正不回写已固定的工作包或实现记录，不据此宣称真机或生产验收通过。实现状态查各端最新阶段记录；OpenAPI沿用历史开发输入的 `x-implementation-status` 标记，不作为运行部署状态。

## 实际检查与固定

执行 `/private/tmp/exam-contract-check/bin/python contracts/resource-plaza-v1-r2/validate.py`，校验原包全部静态检查、新OpenAPI合法性、精确变更边界、新增错误例及 [manifest](manifest.json) 指纹。依赖沿用原包的requirements.txt。脚本只读，不生成或覆盖固定文件。

manifest记录全部原包输入及新交付文件指纹；自身由各docs工作树 `governance/frozen.json` 固定。新增错误例是规范合成数据，真实后端HTTP证据及前端行为验证分别由两端交付记录提供。
