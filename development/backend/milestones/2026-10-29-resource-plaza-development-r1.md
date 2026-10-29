# 资料广场后端独立开发工作包 r1

日期：2026-10-29（Asia/Shanghai）。任务RP-B01/RP-B02，关联REQ-023、REQ-002、REQ-016、REQ-018、REQ-019、REQ-021。状态：**正式契约与工作包交付，后端尚未实现**。

## 1. 基点、范围与输入

docs观察分支 `main`，完整HEAD `1140309e445f6467e0600018c7bd0e0724d0bd23`；保留上轮资料需求/设计及索引的未提交修改。本轮只做文档与契约工具，未修改源码、执行迁移或启动服务。

后端只读快照 `main / 7348433c171e882f3c78c51fc696af3fafb96bb5`，工作区干净；本地develop指针为 `96f3754e02aa2c0c563ea2aa4385f0917e535ac4`。源码定位来自main快照，不假定两个提交代码相同。后续实际实施使用源码 `develop` 与docs `backend-develop`，开始前重新核对规则、完整HEAD、工作区与漂移，不重置现有修改。

必须消费：[需求v1.1](../../../requirements/resource-plaza-v1.1.md)、[正式契约](../../../contracts/resource-plaza-v1/README.md)、[OpenAPI](../../../contracts/resource-plaza-v1/openapi.json)、[规范语义](../../../contracts/resource-plaza-v1/semantics.md)、[动作/版本索引](../../../contracts/resource-plaza-v1/actions.json)、[合成夹具](../../../contracts/resource-plaza-v1/examples.json)、[manifest](../../../contracts/resource-plaza-v1/manifest.json)。共享领域取舍见[固定设计](../../../design/resource-plaza-v1/domain.md)，协议细化以新正式包为准。

契约版本 `resource-plaza/1.0.0`；本次授权是正式化和工作包，不将文档里的实现步骤当作已授权编码、提交、推送或部署。后续获得实施授权即可按此包独立推进，不依赖两前端先完成。

## 2. 工作分解与依赖

| 子任务 / REQ | 实施范围 | 本端完成条件 |
| --- | --- | --- |
| RP-B01a / 023-I–N、Q | 新分类/资料/动作/反馈及受控屏障实体，数据库约束/索引、SQL注释及受限权限 | 新迁移，旧迁移不改；唯一性/FK/状态/版本限制及RLS/身份权限真实PG测试；无API启动DDL |
| RP-B01b / 023-A–E、O–P、R | 学生四个GET、后台四个GET；规范文本、分类/搜索/分页、严格投影、取链重验 | 无非认证或草稿/下架泄漏；mute可读；URI/状态/错误/头与正式包一致；游标签名与绑定真实验证 |
| RP-B01c / 023-F–N、Q–T | 后台六个写命令，版本/幂等、先下架编辑、分类引用保护、审计 | 权限/状态/并发负例；同键不重复创建，下架重放不复活；无变化保存不增版本/清反馈 |
| RP-B02a / 023-U | 反馈PUT、独立feedback.version、唯一票及当前版本汇总 | 四类明确映射、改选/乱序/重复正确；后台无用户明细；不生成举报/处罚或自动下架 |
| RP-B02b / REQ-018、023-U | 内容换版清旧反馈/回执，注销过滤与物理清理、恢复重删 | 屏障后新读/旧命令不能恢复数据；统计立即排除非active账号；隐私处理不删后台共享资料 |
| RP-B03 / 023、REQ-021 | HTTP显式装配、配置/依赖失败、日志屏蔽和性能检查 | 健康模式无资料业务入口；真实DB+HTTP证据；各场景足量P95，不把样例校验算业务通过 |

建议新领域 `internal/resourceplaza`，HTTP边界 `internal/httpapi`，实体与迁移登记遵循当前源码规则。复用command、codec、会话、审计和隐私基础设施，不复用心愿资源锁/学生作者身份来表示资料，不引入搜索服务、下载worker或网盘SDK。

## 3. 必须保持的实现约束

1. 学生读取单独实现verified且无ban谓词，不能直接套用会拒绝mute的通用Verified写权限。反馈再要求无mute。后台当前角色限review_operator/super_admin，不能复制用户查询允许crisis_operator的规则。
2. 读/写在主体guard后使用当前授权状态；查询过滤在limit之前，SQL参数绑定、只ASCII折叠、字面子串。列表不解密链接/提取码，详情/取链用途绑定解密；所有请求/错误no-store，URL不被服务端抓取。
3. 正式错误映射包含VERIFICATION_REQUIRED、CATEGORY_IN_USE、CATEGORY_NAME_CONFLICT、413/415；旧通用handler不能把它们全部降为503或空结果。JSON重复键、整数token、空/重复query等按共同协议夹具处理。
4. 新资源种类及锁序须完整加入引擎/数据库锁函数；后台主体→账号→分类→资料→反馈，维持旧资源相对序。创建/改类/发布/分类停用锁同一分类；反馈与内容修改串行，不能发生旧内容的票写入新版本。
5. 资源version、content_version、本人feedback.version、category.version各用其来源。反馈不改resource.version；内容保存无变化不清票，实质换版同事务清旧票及其回执。行政上下架不清反馈。
6. 资料privacy屏障拒绝普通正文读取；content屏障不能被publish绕过；受控屏障来源/权限及清理适配纳入实现评审，不由学生反馈创建。旧举报路由和枚举不扩展。
7. 反馈汇总批量聚合当前页和active账号，不每行N+1，不回传account_id或名单；不建立浏览/取链计数。日志、SQL/APM不记q/链接/码/全文，后台下架理由加密。
8. 幂等重放当前授权优先，返回当前投影且不重写；新键旧版本409。分类/资料创建最小回执不能因短TTL导致重复对象；反馈回执随内容版/注销清理。

## 4. 独立测试入口与交接

先运行正式包build默认比较与validate（含扩展规则和manifest），将examples中的每个成功请求/错误场景落实为handler/服务测试。静态假token及游标不能放行真实鉴权；真实PG/HTTP夹具由后端在隔离环境构造，不接生产数据。

重点执行原[RP-I01–14、I18](../../../design/resource-plaza-v1/delivery.md)中后端项；新增协议绑定检查见[正式交接](../../../design/resource-plaza-contract-delivery-v1.md)。真实验证角色撤销、ban/mute/注销时序、分类引用竞争、反馈改选/换版及日志屏蔽。固定二维码仅是小程序静态文件，缺图不阻塞本端API测试。

按源码AGENTS：相关包先 `make check-fast PACKAGES=./internal/resourceplaza/...`（实际新增包后）；完整交付运行 `make fmt`、`make check`、`make build`，真实PG/权限变化执行适用集成检查。上述应用命令**本轮均未执行**。

交给前端：实际构建SHA、正式包manifest SHA-256、测试base URL、启用操作清单、角色账号获取方式（不写凭据）、可重建合成资料/分类、实际返回错误及复现步骤。HTTP和数据库本端通过不等于浏览器/微信真机/外链验收通过。

本次实际证据：[后端工作包静态检查记录](../validation/2026-10-29-resource-plaza-contract-r1.json)。它只记录契约及文档交付，无业务实现或真实服务测试。后续实现新增阶段记录及精确源码提交，不改本固定工作包。
