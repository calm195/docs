# 悄悄鲤模块契约 whispers/1.0.0

这是供后端、管理端和小程序独立开发的**设计交付契约**。首期含文字、三档匿名、暖评／抱抱、本人胶囊及治理，语音延期。全部新操作标记`not-implemented`；设计固定不等于运行可用、G3批准、真实验收或上线放行。

## 消费入口

- [OpenAPI 3.1](openapi.json)：独立模块全部路径、operationId、严格schema、鉴权域、错误与状态码。
- [动作索引](actions.json)：所有写操作的投影和版本来源。
- [合成样例](examples.json)：逐操作请求／响应及正反schema夹具，不含真实身份／正文／热线。
- [交付指纹](manifest.json)：需求、设计、工具和契约产物的精确指纹。
- [需求增量](../../requirements/whispers-v1.md)、[详细方案](../../design/whispers-v1/README.md)、[接口语义](../../design/whispers-v1/api.md)、[三端工作包与验收](../../design/whispers-v1/delivery.md)。

本包不覆盖全站OpenAPI 0.2.1或revision 6，旧输入保持原字节。新增后台路由使用模块投影，但复用原审核／治理权限核心。**旧黑名单接口安全退出是明确兼容变更**，部署前必须完成已有设置页和来源入口迁移；详见接口语义。其他旧路由不能意外输出新kind。

## 生成与校验

生成工具仅用于本契约文档，不能启动或实现业务接口：

```sh
python3 contracts/whispers-v1/build.py
python3 contracts/whispers-v1/validate.py
```

`build.py`默认只读比较生成结果；`--build`只允许写未登记固定的本包产物，已固定内容变化必须另建版本。校验需要`jsonschema`和`openapi-spec-validator==0.7.2`；可使用已有隔离Python环境运行，不修改全局依赖。校验不访问网络或真实服务。

校验包括：OpenAPI有效性、全部请求／成功响应的合成实例、所有schema及条件负例、完整读写目录、操作ID唯一、写动作投影／版本来源、无语音路径、引用解析、生成一致性，以及存在manifest时的交付指纹。没有把静态检查视作数据库、隐私、并发、真实微信或供应商验收。

首次完成时追加治理固定清单；未来三端反馈若改变Wire／动作／版本规则，另发新包并声明兼容影响。未完成资源项（字典、援助资料、正式扫描／清理、真机环境）按方案单独追踪，不用临时Mock字段替换本契约。
