# 悄悄鲤体验版增量契约

2026-11-07，根据用户批准的体验版计划新增标题与本人胶囊摘要。模块协商标识沿用 `whispers/1.0.0`，本目录是本次完整结构输入，旧 [whispers-v1](../whispers-v1/README.md) 保留。

- 心愿以外的悄悄话创建、更新可传 `title`，显式标题为1至40个字符，省略时服务端使用「未命名悄悄话」。新小程序将标题作为必填项。
- `PublicPost.title` 返回本版本已审公开标题。`OwnerPost.title` 在正文受隐私或安全屏障时返回空值。标题随正文版本保存、送审、撤回和清理。公开改稿后，旧公开标题与正文一并停止读取。
- `CapsuleSummary.preview` 为必需的可空字段。仅当前本人已解锁的合规正文可返回前三个字符，其余状态返回空值。摘要采用字符计数，避免截断表情。
- 抱抱、评论、匿名身份、权限动作和幂等语义沿用原契约。

[OpenAPI](openapi.json)、[动作目录](actions.json)、[合成夹具](examples.json) 供消费者同步与验证。[manifest](manifest.json) 记录本包指纹。静态夹具通过不代表真实微信或真机验收通过。

使用已安装 `jsonschema` 和 `openapi-spec-validator` 的隔离 Python 环境运行 `python contracts/whispers-v1-r2/validate.py`，只读检查结构、正反样例与指纹。
