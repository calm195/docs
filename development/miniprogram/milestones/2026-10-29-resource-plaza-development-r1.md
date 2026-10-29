# 资料广场小程序独立开发工作包 r1

日期：2026-10-29（Asia/Shanghai）。任务RP-M01/RP-Q01，关联REQ-023、REQ-002、REQ-016、REQ-018。状态：**正式契约与工作包交付，小程序尚未实现**。

## 1. 基点与输入

docs观察分支 `main / 1140309e445f6467e0600018c7bd0e0724d0bd23`，延续已固定但未提交的资料需求/设计及索引。小程序源码只读快照 `main / 3bcec888230a6cf3b096d2c51e3ea03ca15f9c7a`，工作区干净；本地develop同一提交。后续实际实施按用户指定源码 `develop`、docs `mini-deveop`（保留拼写），开始前重新检查完整HEAD、状态及规则。

共同输入：[需求v1.1](../../../requirements/resource-plaza-v1.1.md)、[resource-plaza/1.0.0](../../../contracts/resource-plaza-v1/README.md)、[OpenAPI](../../../contracts/resource-plaza-v1/openapi.json)、[规范语义](../../../contracts/resource-plaza-v1/semantics.md)、[动作索引](../../../contracts/resource-plaza-v1/actions.json)、[合成夹具](../../../contracts/resource-plaza-v1/examples.json)、[manifest](../../../contracts/resource-plaza-v1/manifest.json)、[客户端设计](../../../design/resource-plaza-v1/clients.md)。

本轮未改源码、未编译微信包、未执行真机或剪贴板操作。工作包使后续可独立实施，不把文档正式化当作编码、提交、推送、部署授权。

## 2. 工作分解

| 子任务 / REQ | 实施范围 | 本端完成条件 |
| --- | --- | --- |
| RP-M01a / 023-A、R | API/types与响应解析，学生会话/认证/账号门禁 | 只消费5个学生接口；游客/未认证/封禁拒绝，mute读/复制允许；响应目标绑定及错误分支齐全 |
| RP-M01b / 023-B–D、P | 首页通用入口、资料列表、分类与搜索、分页 | 非认证首页无资料摘要；后端过滤；重置/空/错误分开，旧游标/晚到响应不能污染 |
| RP-M01c / 023-E、O | 详情、链接/码、两种复制按钮及取链重验 | 每次点击新取链，目标与version一致才写剪贴板；失败不复制旧缓存，成功回调才提示 |
| RP-M01d / 023-U | 四类反馈、本人回显/改选、版本及幂等 | 一票可改，初次版本0；无举报/自由文本/附件；mute不允许反馈，409重读确认 |
| RP-Q01 / 023-V、W | “资料投稿”固定二维码弹窗、缺图状态、查看大图 | 列表空结果仍有入口；图片完整不裁剪、可关闭；不做投稿表单/上传/自动发微信；正式图待提供 |
| RP-M01e / 023-A、R、REQ-018 | 页面生命周期/epoch清理与构建回归 | 退出/切账号/隐藏页面后旧请求不落屏，受限数据不持久化；本端测试与微信构建有独立结果 |

建议文件：`src/api/resources.ts`、`src/types/resource.ts`、`src/pages/resources/index.vue`、`detail.vue`；注册pages.json并接入首页。必要纯函数和页面共用逻辑放utils/composables，复用当前request.ts、Pinia用户状态和session epoch；不复制另一套令牌存储。上述仅拟定工作范围，不是本轮已创建文件。

## 3. 查询、复制及反馈约束

5个学生操作由actions.operations的student_read/student_write筛选得出；不能使用后台令牌/接口读取资料或分类。页面onShow先确认当前会话与用户状态，直接深链详情同样门禁；不能沿用心愿公共列表允许游客的代码路径。

query只发规范数字/布尔，不带空cursor；“全部分类”省略category_id，q为空可省略。分类改动/搜索确认清空旧分页，加载更多按ID去重；资源列表max50，类别列表max100，两者默认值不同。分类完整目录需要消费next_cursor，不假设只有首100项；变更后可重新加载，不持久缓存旧目录。

详情严格解析规范化字段、nullable码、my_feedback及动作。resource.version只用于复制，content_version用于反馈，不以计数或时间戳代替。详情的原链接用于展示，每次点击复制都请求download-info并核对resource_id/version、当前主体/epoch/页面代次；仅复制链接取download_url，复制下载信息取已校验copy_text。

HTTP失败/目标错配/版本错配/剪贴板失败均不回退复制旧数据。401清会话及资料，403认证提示/封禁按error_code区分，404清旧详情，409先刷新并等待新点击。离开页面或换账号后到达的成功回调不得提示，也不主动清用户系统剪贴板；已经复制外部链接无法撤回。

反馈选项顺序固定有效/链接失效/年代久远/不全，无自由文本、投诉/举报、附件、取消或其他人统计。按钮提交仅当允许submit_feedback；选择变化与服务端已保存状态分开。初次expected_feedback_version=0，有my_feedback用其version；expected_content_version用当前详情。请求未知结果保留同键同输入，改选为新命令，晚到响应不能覆盖新选择。内容换版旧反馈不回显，不自动把旧选项再投给新版本。

本模块数据只在内存：资料/链接/码/关键词/反馈状态不写本地持久化、不塞页面URL或分享卡。传输/状态错误不能伪装空结果或模拟成功。合成认证与假token不能用于运行登录。

## 4. 固定二维码与真实依赖

投稿入口经过模块认证门禁，认证有效的禁言用户可查看。固定图片拟置于src/static中，通过构建配置引用；实际原图尚未提供时显示“投稿二维码暂未配置”，不得生成假联系人二维码填空。弹窗说明添加负责人微信，备注“资料投稿”；查看大图与关闭不发微信消息，也不生成“投稿成功”回执。

取得正式PNG/JPEG后记录图片版本/指纹及负责人提供来源，保证完整比例、留白、不同屏幕适配；不自动裁剪或添加遮挡。固定静态图片不是逐用户保密载体，替换需构建发布；本轮没有后台上传/配置API。未提供原图不阻塞查询、复制、反馈和缺图状态开发，但阻塞正式二维码真机可识别验收。

## 5. 验证与交接

正式examples可用于测试传输及解析器；必须覆盖全5操作、适用错误、跨目标取链、copy_text错配、反馈旧内容版/乱序、未认证/ban/mute、页面隐藏/切账号。假的成功剪贴板回调只验证UI分支，不证明WeChat系统能力。

对应原[RP-I01、I03–07、I10–17及I18客户端项](../../../design/resource-plaza-v1/delivery.md)。按源码AGENTS运行 `npm run check`，页面/配置变化运行 `npm run build:mp-weixin`；本轮均未执行。真实联调需后端已启用5接口、测试学生状态、已上架/下架资料和真实外链样本；剪贴板及二维码识别分别在真机记录，不拿浏览器Mock或编译结果替代。

实现交接提供源码完整SHA、包manifest SHA-256、所用二维码指纹、完成范围、检查和真实/模拟边界；缺图仍明确未完成正式图验收。当前仅有[静态工作包检查记录](../validation/2026-10-29-resource-plaza-contract-r1.json)，不代表RP-M01/RP-Q01已开发或已验收。
