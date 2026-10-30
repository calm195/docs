# 当前契约入口

更新：2026-10-30。本页整合有效契约及其继承关系；契约JSON、规范语义和已登记输入指纹保持原样。实现与验收状态以[三端现状](../README.md)为准，固定包中制定时的 `not-implemented` 等字段不是当前进度表。

| 能力 | 有效输入 | 消费边界 |
| --- | --- | --- |
| 全站基础 | [OpenAPI0.2.1](openapi.v0.2.1.json)、[动作revision6](actions.v0.2.1.json)、[示例](examples.v0.2.1.json)、[指纹](actions-review.v0.2.1-r6.json) | 基于0.2.0；[屏蔽协议](blocks.v0.2.1.md)与已启用[树洞opaque协议](whispers-v1/README.md)按当前装配消费 |
| 聊天 | [读取者方向增量](chat-viewer.v0.2.1-r1.md) | `viewer_is_sender`按当前读取者返回，不泄露发送者账号标识 |
| 悄悄鲤 | [whispers/1.0.0](whispers-v1/README.md) | 文字、身份、暖评/抱抱、通知、胶囊及隐私兼容 |
| 用户查询 | [admin-users/1.0.0](admin-users-v1/README.md) | 三个只读GET；昵称搜索与脱敏投影 |
| 用户直接处置 | [user-restrictions/1.0.0](user-restrictions-v1/README.md) | 独立状态读取与四个POST，超管、必填理由、版本/幂等与加密审计 |
| 资料广场 | [resource-plaza/1.0.1](resource-plaza-v1-r2/README.md)、[完整OpenAPI](resource-plaza-v1-r2/openapi.json) | 仅补创建隐私重放404；[1.0.0语义/动作](resource-plaza-v1/README.md)与学生接口不变 |

按业务查需求与设计见[模块总览](../modules.md)。[基础错误码](errors.md)、[0.2.0决定](decisions.v0.2.0.md)、[基础语义](semantics.md)在未被有效增量修订处继续适用。

## 保留与历史

0.2.0、revision5及资料1.0.0仍是当前生成/兼容检查的输入，不作为重复文件删除。旧0.1.0、早期动作评审、未激活审核草案和旧导航/工作包从当前目录移除；历史内容见[清单](../governance/retired.json)。本页旧版也是revision5历史输入，其原字节保存在清单指定Git快照，不重算旧指纹。

模块固定README中的工作包/旧计划链接代表制定时快照，历史引用由文档检查核验；日常进入模块实现、缺陷与安排请使用三端当前页面。协议语义变更继续另发版本，不因文档整理修改接口字段或授权。

## 校验

在安装 [契约依赖](resource-plaza-v1/requirements.txt) 的独立Python环境中运行：

```sh
python3 scripts/check_contracts.py
```

从docs根目录执行。该入口复制当前契约、需求/设计等输入到临时目录，仅补回校验仍引用的已退役历史材料，然后运行既有静态校验；结束删除临时目录，不向工作区恢复旧文件、不重新生成固定契约。缺依赖应明确报错，不能跳过后宣称通过。
