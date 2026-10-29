# 资料广场正式模块契约 resource-plaza/1.0.0

日期：2026-10-29。REQ-023。用户要求将接口提案正式化并交付三端独立开发工作包。本包是**正式、固定的开发输入，全部15个接口仍为not-implemented**；不代表独立评审、G3、业务实现、联调或上线通过。

## 固定输入

- [OpenAPI 3.1](openapi.json)：8个GET、7个写命令；学生认证读/反馈，后台资料/分类管理。
- [规范语义](semantics.md)：字段规范化、主体权限、状态/版本、幂等、分页、反馈和错误行为。
- [动作索引](actions.json)：UI提示到operationId及版本来源；不是绕过服务端授权的依据。
- [合成样例和正反夹具](examples.json)：覆盖每个接口及适用错误，均非真实数据/token/网盘链接。
- [生成器](build.py)、[规范对照器](rules.py)、[校验器](validate.py)、[工具依赖](requirements.txt)。
- [manifest](manifest.json)：需求/设计输入、包产物与工作包的SHA-256及三端源码只读快照。

使用本包必须同时执行标准Schema及 `x-contract-text` / `x-invariant` 规则，不能只生成类型后跳过规范化、复制文本拼接和反馈求和/绑定检查。每个操作及错误的完整结构以本包为准，不与旧接口猜测拼接。

资料没有举报入口/接口；四类反馈为有效、链接失效、年代久远、不全。投稿仅显示负责人固定二维码，无线上投稿、图片上传或微信自动发送接口。实际二维码待资料方提供，不影响契约静态验证。

## 三端独立入口

- [总交接与联合验收补充](../../design/resource-plaza-contract-delivery-v1.md)
- [后端工作包](../../development/backend/milestones/2026-10-29-resource-plaza-development-r1.md)
- [管理端工作包](../../development/admin/milestones/2026-10-29-resource-plaza-development-r1.md)
- [小程序工作包](../../development/miniprogram/milestones/2026-10-29-resource-plaza-development-r1.md)

后端可以按合成请求建立隔离DB/HTTP测试；管理端与小程序可以按相同响应/错误夹具实现测试传输层，而无需其他端先运行。生产/实际页面不得把合成成功当真实后端结果。独立开发输入就绪不等于本次授权业务编码；工作包列明后续检查、分支与完成条件。

## 只读校验及再生成

在具备[依赖](requirements.txt)的Python 3.9+环境，从docs根目录执行：

```sh
python3 contracts/resource-plaza-v1/build.py
python3 contracts/resource-plaza-v1/validate.py
python3 scripts/check_documents.py
git diff --check
```

本次使用既有隔离Python环境（jsonschema 4.25.1、openapi-spec-validator 0.7.2），未安装或修改业务仓库依赖。实际检查记录位于三端工作包链接的validation文件。

build默认只读比较。`--build`只用于未固定产物首次生成；差异文件一经登记frozen即拒绝覆盖，且写入前预检全部产物，避免部分改写。validate默认检查manifest；`--skip-manifest`仅供本包固定前诊断，不构成完整交付检查。无需访问外网或真实服务。

包固定后不得原地修改OpenAPI、工具、夹具、规范或manifest；变化另发新版本并更新消费者。既有全站0.2.1、树洞及用户管理固定契约保持原字节；本包不扩展旧举报枚举、不改变原接口运行状态。旧资料广场设计继续保留历史“提案”文字，当前正式入口以本包及总交接为准。
