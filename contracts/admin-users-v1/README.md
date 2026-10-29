# 平台用户管理独立开发契约 admin-users/1.0.0

日期：2026-10-29。状态：**设计交付、尚未实现**。依据用户已采纳的[需求 v1.1](../../requirements/admin-users-v1.1.md)和[设计 v1.1](../../design/admin-users-v1.1.md)，以及本次“后端管理端可参考独立开发的产物”指令。本包将三个新增只读查询的 Wire、导航提示、版本来源与验收输入固定，供两端按同一输入分别开发；不宣称独立评审、G3、运行验收或上线批准。

## 两端入口

- [交付总览与联调矩阵](../../design/admin-users-delivery-v1.md)
- [后端工作包](../../development/backend/milestones/2026-10-29-admin-users-development-r1.md)
- [管理端工作包](../../development/admin/milestones/2026-10-29-admin-users-development-r1.md)
- [OpenAPI 3.1](openapi.json)：三个新增GET及严格字段白名单。
- [规范语义](semantics.md)：搜索、分页、权限、注销、历史投影及导航精确定义，与OpenAPI一起消费。
- [合成样例及正反夹具](examples.json)：成功、错误及搜索向量；仅用于隔离开发，游标不是有效签名令牌。
- [动作/版本索引](actions.json)：新增导航提示与三个既有写动作的原契约引用。
- [交付指纹](manifest.json)：固定输入、源码快照与包产物可复核定位。

不覆盖[全站0.2.1](../openapi.v0.2.1.json)或[树洞1.0.0](../whispers-v1/README.md)，不把原契约历史实现元数据当当前运行事实。GET新增与原POST同路径不同方法共存；后台账号列表仍为 `/admin/accounts`。用户页不新增写接口、不返回案件正文或匿名内容归属。详情新增 `account_version` 是对原设计尚未解决的版本来源的明确化，适用边界见规范语义。

## 校验与变更

```sh
python3 contracts/admin-users-v1/build.py
python3 contracts/admin-users-v1/validate.py
python3 scripts/check_documents.py
git diff --check
```

`validate.py`使用既有隔离环境的 `jsonschema` 与 `openapi-spec-validator==0.7.2`，不访问外网或真实服务。`build.py`默认只读比较；`--build`仅首次生成未固定文件，登记固定后拒绝覆盖有差异的产物。后续修改Wire、权限或版本规则须另发新包并更新索引；不改本包或旧输入指纹。

静态检查验证OpenAPI、schema正反例、全部GET样例、导航枚举、既有动作定位、生成一致性、搜索规范向量自洽及指纹；不替代数据库搜索、鉴权并发、注销、浏览器、性能或微信验收。本次只创建文档和契约工具，没有业务实现。
