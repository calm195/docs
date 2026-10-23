# 本地隐私后台与全模块联调启动

## 授权、基点与范围

用户要求“隐私删除未启动，还有什么未启动的，都需要启动联调”。本轮补齐本地隐私接线并启动现有业务进程、中间件、管理工具和基础监控；沿用原文人工审核、不接真实识别/通知的边界。关联REQ-004/005/007/008/014/017/018/019及REQ-020工程范围，不新建业务需求或签发验收审批。

源码develop基点为`aaacbaf9c18006e5ae7128b1d915558b5dab999c`，docs backend-develop基点为`e59fa854df89407a1db3506d7d743f50c1533b60`，开始时两仓库干净。本轮源码8个文件尚未提交，以验证清单SHA-256确定字节；没有新增提交或推送。沿用契约0.2.0/revision 5及既有隐私阶段的辅助进度接口，不改变共享契约、已固定阶段或需求设计。

## 实现与运行事实

此前本地缺PrivacyDSN、EvidenceDeletionDSN、EvidencePurgerDSN、RecoveryWriterDSN/ReaderDSN及RecoveryWrapKey，隐私API未装配，两个worker未启动。新增privacy-init显式创建业务三类窄权限身份、独立恢复PG容器/卷、恢复库与writer/reader/migrator身份，复用已交付journal-up/permissions及业务bootstrap，不修改SQL迁移。迁移凭据隔离在私有文件，历史配置与微信凭据保留；已有恢复库缺历史配置时拒绝生成替代密钥。独立恢复容器仍在同一宿主，不声称生产故障域隔离。

新增dev-privacy-worker与dev-evidence-worker，分别指定account/evidence scope，独立锁/PID；dev-stop验证进程归属并停止五个应用，infra-stop维持先应用/采集后中间件的停止顺序，包含恢复库且保留卷。初始化成功后登记隐私启用标志，后续dev-infra纳入恢复库；普通启动不执行DDL。原生privacy-init明确拒绝，避免把业务集群冒充独立恢复资源。

目前API、学生卡MQ worker、内容MQ worker、账号与证据清理worker均运行。日常项目liyuanci-local的业务PG/恢复PG/Redis/NameServer/Broker、三个管理工具及独立liyuanci-local-observability的基础Alloy/Loki/Grafana/Prometheus栈运行。MQ主题显式建立，配置由已有模板复制到.local，只供本地使用；manual内容模式仍保留原文并强制人工审核。基础监控没有开启中间件exporter、Linux宿主指标或真实通知，不把macOS Docker VM冒充Linux宿主；宿主Go日志仍在.local/local/logs。

认证、学生卡/人工认证、心愿/应愿/匹配、聊天/通知、故事/分享、审核/词库、举报/处罚/申诉、危机后台和隐私注销/证据删除路由均在同一API装配，不需要另启每个领域的HTTP进程。pgAdmin追加恢复日志只读连接，未保存口令。接口、工具地址、凭据位置与重启命令见[当前开发入口](../host-development.md)。

## 实际验证与限制

- 入口单测35项通过；make fmt、make check通过，Go源码无变化，不重复全量构建。隐私首次与重复初始化及doctor通过，已有三份凭据文件全部字段在重复初始化前后不变。
- 使用本机两个真实PG容器中的随机测试数据库运行TestPrivacyDeletion，17组通过，覆盖受理、即时屏障、六行矩阵、独立日志确认、失败/缺适配器保持processing、证据受理/清理、恢复重删及HTTP边界。外部清理/脱敏是合成夹具，不在日常业务库插入或删除账号/证据。
- 真实PG+RocketMQ运行TestModerationCore，19组通过，包含实际NACK重投和常驻转发订阅；独立测试消费组、随机数据库，分析供应商为合成夹具。
- 五个宿主进程均存活；后端healthz、pgAdmin ping、Redis Insight health、MQ Dashboard、Grafana health均200。匿名隐私写入/证据进度401且no-store，非法匿名回执404；后台真实登录200、危机列表200、随机不存在删除工作404，按幂等协议注销测试会话204。未对日常账号/证据发起删除请求。一次HTTP探测漏幂等键导致退出会话400，补齐后复核204；不把请求校验失败视为服务失败。
- 未运行完整make integration、原生隐私初始化、Docker业务镜像启动或两端浏览器/手机验收。没有真实识别/脱敏、全版本对象/缓存清理或危机通知适配器；两个隐私worker虽常驻仍保持未完成任务processing，不能向联调端宣称物理清除成功。学生卡与学校规则仍为既有开发模拟，未验证实机微信。

变更文件、指纹与脱敏HTTP/进程证据见[验证清单](../validation/2026-10-23-local-privacy-startup-r1.json)，[实际数据库/MQ测试输出](../validation/2026-10-23-local-privacy-startup-r1.txt)。README、host-development和端内索引同步入口。交付前运行文档与固定指纹检查，不更改历史固定条目。
