# 后端现状

更新：2026-10-30。源码核对基点 `968248fcd2e9aa0fe620d572dd69f3f7fb00084a`；本轮只整理文档。入口：[缺陷与缺口](defects.md) · [后续计划](plan.md) · [模块与契约](../../modules.md)。

## 模块实现

| 模块 | 当前能力 | 实现边界 |
| --- | --- | --- |
| 认证与账号 | 微信换会话、本人资料、学生卡扫描状态、人工认证；后台本地账号、角色、改密与会话 | 正式学校身份、扫描与存储供应商仍需验收；后台与学生身份隔离 |
| 心愿与应愿 | 草稿、审核、主动上架、公开分页、申请、唯一匹配、撤销、重招募、实现与回退 | 资格、额度、版本和屏障在服务端复核；审核通过不等于自动上架 |
| 聊天、故事与分享 | 匹配会话、审核送达、增量读取、站内通知、还愿故事、分享引用与公开主页 | 消息提供 `viewer_is_sender`；会话结束后只读；撤回后重新检查可见性；外部微信通知未接入 |
| 悄悄鲤 | 文字树洞、三档身份、已审昵称、暖评、评论开关、抱抱、通知、本人胶囊 | 匿名标识不关联账号；胶囊到期前不返回正文；语音与媒体不在当前实现范围 |
| 审核与安全 | 词库版本、普通/涉校人工复核、危机隔离、举报、处罚、申诉、opaque 屏蔽 | 已补词库优先筛选和 Workspace 屏蔽动作；正式词库质量、危机关怀与外发仍有缺口 |
| 平台用户 | 列表、昵称搜索、详情、处罚历史；超管直接封禁/解封、禁言7天/取消禁言 | 必填理由、版本与幂等校验、加密审计；解封不解除仍有效禁言，不恢复已隔离内容 |
| 资料广场 | 15个操作：认证用户查询/复制/四类反馈，后台资料和分类维护 | `resource-plaza/1.0.1`；链接与提取码加密；服务端不访问外部网盘 |
| 隐私与恢复 | 注销屏障、匿名回执、账号/证据分域清理、恢复前重删 | 外部全版本清理、独立故障域与90天恢复未验收，失败保持 processing |
| 工程与运行 | Go模块化单体、独立worker；PG权威、Redis限流、可选MQ与数据库补偿 | 开发入口与生产装配分离；普通启动不迁移、不重置账号、不替换历史密钥 |

源码边界可从 [studentapi](../../../liyuanci-backend-go/internal/studentapi)、[whisper/whisperapp](../../../liyuanci-backend-go/internal/whisperapp)、[resourceplaza](../../../liyuanci-backend-go/internal/resourceplaza)、[privacy](../../../liyuanci-backend-go/internal/privacy) 核对。日常启动、环境与配置以[源码 README](../../../liyuanci-backend-go/README.md)和[功能链路说明](../../../liyuanci-backend-go/FUNCTIONALITY.md)为入口。

## 已有验证与限制

- 2026-10-30 同一业务源码版本的 `make fmt`、`make check`（vet、race、coverage）通过；本次文档整理不将旧结果冒充新业务测试。
- 2026-10-29 已有真实PG/HTTP与微信开发者工具A/B局部链路：认证、心愿、匹配、双向聊天、屏蔽、审核分流；资料、故事、胶囊另有局部证据，不能合并宣称新版本全模块重测通过。
- 学生资料/卡片、扫描、KMS等仍含本地适配；外部通知、全副本清理、独立恢复、手机真机与容量验收未完成。
- 最近一次已记录的运行收尾是2026-10-29停止API、worker及所选本地中间件，保留数据和配置。本轮没有探测或变更服务状态，不能据历史记录判断当前进程是否运行。

历史依据：[联调收尾](https://github.com/calm195/docs/blob/781d177221efdb9e955956343c4f2ceda8494eff/development/backend/validation/2026-10-29-local-three-client-closeout-r1.md)、[覆盖矩阵（以末尾修复后增量为准）](https://github.com/calm195/docs/blob/781d177221efdb9e955956343c4f2ceda8494eff/development/backend/validation/2026-10-29-local-three-client-coverage-r1.md)。
