# 审核结果枚举差异补充

日期2026-10-23（Asia/Shanghai），关联T017、REQ-015、REQ-019。来源为[真实接口接线阶段](2026-10-23-content-api-only-r1.md)之后继续只读查看后端返回分支，不是实际请求验证。

## 已观察事实

正式0.2.0 `ModerationOutcome.business_outcome`只包含published、delivered、cancelled、privacy_review_required、pending_review、ready、expired、active。后端`develop`完整HEAD基点`3aa2ecf2480386a94552efe6abbc3479da91e479`的`internal/moderation/review.go`在危机复核且应愿已accepted时会返回accepted；心愿危机复核还可能返回当前wish.State。后端工作区有既有未提交修改，本会话未修改它。

管理端`develop`基点`cc0193bba6de30d1a8be0c08c8852a94ea62b3fd`的本轮未提交代码继续按正式枚举校验，不把未批准的新协议值解释为公开或恢复交互；普通已知结果继续可消费。若服务端已提交决定却返回额外枚举，当前页面会提示结果未确认，不能据此认定服务端回滚，须刷新相关业务状态并按原键核对。

## 待协调问题与边界

后端/契约协调方应核对危机复核实际返回集合，选择对齐正式枚举或按影响另发契约版本；不得原地重写固定0.2.0输入。管理端届时补充对应结果标签和回归，不在本轮自行扩张业务语义。普通七项审核/词库接口接线不因此停止，完整危机复核结果验收保留该缺口。

本轮用户要求无需验证，因此没有真实执行该分支或检查命令，不把源码推断写成实际故障。docs使用admin-develop，完整HEAD基点`3d1d1f395128d8bb0d1a1bc692b04095eea3f12e`；没有源码提交、共享契约变更、后端改动或共享台账修改。
