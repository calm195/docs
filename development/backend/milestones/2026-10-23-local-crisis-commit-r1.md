# 本地危机后台精确源码提交补充

## 来源与提交状态

用户于2026-10-23明确授权将本次危机后台相关后端修改及对应文档分别提交到develop和backend-develop，暂不推送。关联既有REQ-015、REQ-017、REQ-018、REQ-019、REQ-020，共享正式契约0.2.0不变；不新增业务需求或签发生产验收。

后端分支develop，完整源码提交`aaacbaf9c18006e5ae7128b1d915558b5dab999c`，提交说明为`feat(dev): 补齐本地危机后台独立身份与启动配置`，父提交`d4b70f906818a83f13609f305a78480241bf3355`。后端提交后工作区干净。docs分支backend-develop，提交前HEAD基点`0a3b52c565ff91cdac69456e2149d893c136dbe2`；本记录及对应文档在源码提交之后提交。未推送、合并或部署，未改变已运行本地服务的生命周期。

## 固定记录与验证关联

本记录补充[原阶段记录](2026-10-23-local-crisis-api-r1.md)的未提交历史状态。原记录SHA-256为`d5680952e6bb6345f8d311b220a37d972bca48167020e0011cc114f8521e5cdc`；[原检查证据](../validation/2026-10-23-local-crisis-api-r1.json)SHA-256为`e1cd23faa42e11032b8e536a80d12519cf88e408ebd8ed07502be52ef582eb32`。保持原记录和证据的字节及历史状态不变，不改写已固定条目。

证据登记的七个源码文件已从上述精确Git提交逐一读取并校验SHA-256，全部相同。原make fmt、make check、make build、32项入口测试、本地真实危机/普通运行身份检查、dev-doctor、本地登录及危机查询检查、隔离真实PG的14项危机子用例结果可关联到本提交；源码没有后续变化，不重复执行已通过的全量测试。

## 提交范围与边界

源码包含README.md、scripts/init-business-dev.py、scripts/localdev.py、scripts/tests/test_business_initialization.py、scripts/tests/test_localdev.py、internal/devapp/content_worker_test.go及internal/moderation/crisis_integration_test.go：显式初始化独立危机登录与CrisisDSN，支持宿主连接地址派生，保护历史凭据和普通身份隔离，并验证人工升级、接手、跟进、结案及误报新任务回退。没有SQL迁移或业务策略变更。

对应文档包含当前启动说明、端内索引、原阶段与两份验证证据、本提交补充，以及固定清单追加。凭据、连接串、本机状态及日志留在.local忽略目录，不进入提交。真实识别、关怀资源及人员通知均未接入；写流程以独立PG与正式HTTP处理器验证，未在日常业务数据上执行写流程；完整make integration、MQ、管理端浏览器和真机等未验证范围沿用原记录。

本次提交检查核对两仓库分支、完整HEAD、工作区、暂存范围、七文件指纹及git diff --check；docs执行python3 scripts/check_documents.py检查链接、固定指纹和旧条目不可变。未推送。
