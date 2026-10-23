# 原文人工审核精确源码提交补充

## 来源与提交状态

用户于2026-10-23明确授权将本次后端修改与对应文档分别提交到develop和backend-develop，暂不推送。关联既有REQ-015、REQ-018、REQ-020，共享正式契约0.2.0；不新增业务需求或生产审核策略。

后端分支develop，已提交完整源码版本`d4b70f906818a83f13609f305a78480241bf3355`，提交说明为`feat(dev): 支持原文人工审核并修复启动权限检查`，父提交`3aa2ecf2480386a94552efe6abbc3479da91e479`。提交后后端工作区干净。docs分支backend-develop，提交前HEAD基点`3d1d1f395128d8bb0d1a1bc692b04095eea3f12e`；本记录与对应文档在后端提交之后提交。未推送、合并或部署。

## 固定记录关联

本记录补充[原阶段记录](2026-10-23-manual-review-startup-r1.md)中“源码未提交”的历史状态。原记录SHA-256为`fb965ce270c525da6bb4c37be2247c6866b51e56c59a556d80650aa7f0cf2e04`，不修改其内容、历史状态或指纹。

[原启动证据](../validation/2026-10-23-manual-review-startup-r1.json)SHA-256为`c3e2dde9611a56e463fe573e6069a2c993edc5d899209f22e3e309c7f4ec4673`。其中登记的五个源码文件在提交前逐一校验，全部与本次提交字节一致，因此原检查结果可以关联到上述精确源码提交。未为提交重复执行已通过且源码未变化的全量Go检查。

## 范围与验证

提交包含README.md、cmd/content-worker/main.go、internal/devapp/application.go、internal/devapp/content_worker.go、internal/devapp/content_worker_test.go五个文件：显式manual开发模式保留原文并强制人工复核，私聊同样转人工，生产拒绝开发模式；启动证据表存在性检查改用系统目录，普通运行身份仍无证据模式USAGE。没有新增SQL迁移文件。

原有make fmt、make check、make build、32项入口单测、四个真实受限连接池检查、dev-doctor及独立PG审核核心17项子用例结果保持，详见原证据。完整make integration、MQ往返、微信真实code交换、手机HTTPS及跨端实际内容审核仍未验证；原文人工模式没有真实隐私脱敏能力，当前空开发词库没有真实危机识别能力。

本次提交检查包含两仓库分支/完整HEAD/工作区、五文件指纹、暂存范围及git diff --check；docs运行python3 scripts/check_documents.py核对文档链接、固定指纹和旧条目不可变。凭据、本机运行状态、对象目录及日志均留在.local忽略目录，不进入任一提交。未改变已启动服务的生命周期。
