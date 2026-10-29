# 资料广场管理端独立开发工作包 r1

日期：2026-10-29（Asia/Shanghai）。任务RP-A01，关联REQ-023、REQ-018、REQ-019。状态：**正式契约与工作包交付，管理端尚未实现**。

## 1. 基点与固定输入

docs观察分支 `main / 1140309e445f6467e0600018c7bd0e0724d0bd23`，延续此前资料需求/设计及索引的未提交修改。管理端源码只读快照 `main / 9dea53857348bd3e7c91edce65e81bc5625e5b2a`，工作区干净；本地develop指针为 `305b004ddd9a0d2c6fab16d6a8a23cd932320167`，未把两个版本视为等同。后续实际开发使用源码 `develop`、docs `admin-develop`，重新检查HEAD/状态并保护已有改动。

共同输入：[需求v1.1](../../../requirements/resource-plaza-v1.1.md)、[resource-plaza/1.0.0](../../../contracts/resource-plaza-v1/README.md)、[OpenAPI](../../../contracts/resource-plaza-v1/openapi.json)、[规范语义](../../../contracts/resource-plaza-v1/semantics.md)、[动作索引](../../../contracts/resource-plaza-v1/actions.json)、[合成夹具](../../../contracts/resource-plaza-v1/examples.json)、[manifest](../../../contracts/resource-plaza-v1/manifest.json)。交互依据[客户端设计](../../../design/resource-plaza-v1/clients.md)。

本次只生成文档/契约，没有源码修改、运行联调或应用测试。独立工作包是后续实施依据，不自行扩大为业务编码、提交、推送或部署授权。

## 2. 端内工作包

| 子任务 / REQ | 实施范围 | 本端完成条件 |
| --- | --- | --- |
| RP-A01a / 023-H、R | types/services及严格unknown解析器，路由/菜单管理权限 | 所有后台接口仅两角色；schema及扩展约束完整；无举报/反馈名单/二维码上传菜单 |
| RP-A01b / 023-F–N、P、T | 资料列表、查询/分页、详情/新建抽屉 | 正式字段与状态，列表不取链；创建完整草稿，成功后重读；误响应/未知字段不可放行 |
| RP-A01c / 023-S、T | 上下架与编辑流程、理由/版本/幂等、冲突处理 | published先确认下架；成功后取消仍offline；无自动保存并上架、无409自动覆盖 |
| RP-A01d / 023-J、Q | 分类列表/创建/改名排序/启停 | 唯一名称/版本、引用中拒绝停用；不删分类、不批量迁类；错误保留合法输入 |
| RP-A01e / 023-U | 当前内容版本四类汇总 | 总数及content_version检查；无学生名单；提示换版清票，负面反馈不自动下架 |
| RP-A01f / 023-R、REQ-018 | 请求代次、账号切换/撤权清理、边界回归 | 在途旧响应不落屏；表单/链接不持久存储；测试及构建通过且明确模拟范围 |

建议文件：`src/types/resources.ts`、`src/services/resources.ts`、`src/composables/useResources.ts`、`useResourceCategories.ts`、`src/views/ResourcesView.vue`及`ResourceCategoriesView.vue`，必要组件位于src/components。采用现有Vue3/TypeScript、服务I/O与查询/抽屉分离模式，不为资料引入新网络层或全局表单store。

## 3. 接口消费与UI规则

管理端消费10个后台操作，名单以actions.operations的principal=admin为准；不调用学生反馈PUT，二维码投稿不需要后台服务。菜单/路由按review_operator或super_admin，服务端返回才是当前权限和对象状态依据。

列表AdminResourceSummary包含content_version、visibility_blocked和feedback_summary；不是学生摘要加一个status即可。详情无my_feedback；不得从未知字段或测试夹具拼出用户身份。allowed_actions的update/publish/offline只对应资源目标，category.version和resource.version不可混用。

PUT内容是完整五字段+expected_version，description清空传空串/null后归一，码清空传null。响应必须是规范化字段，UI采用返回值重新显示，不保留服务器已拒绝的“成功状态”。URL按UTF-8字节而非JS length计上限，中文/emoji字段按码点计数；页面先校验，服务端仍权威。

编辑流程：published无update动作，“下架后编辑”先独立offline并确认理由，结果不明保留同键核实；只有确认offline后进入可保存表单。保存后仍offline，显式publish用最新详情version；取消编辑/保存失败不恢复。资料privacy屏障404时清正文及表单，不从旧状态回显；content屏障资料提示不可发布，不揭示无权原因。

创建幂等重放仍201，但返回当前对象可能已被其他操作改变；不要仅看201就插入重复行或强制标draft。原写成功后刷新失败提示“操作已成功，刷新失败”，不再提交新命令。409按明确error_code区分版本/状态/同键冲突/分类占用/重名，不能统一自动换键重发。

分类或关键词修改后不继续旧游标；查询清栈，返回按主体/请求代次判断。抽屉开启维持查询位置，写时防重复关闭；撤权/换账号立即清空表单、详情、待重试请求。关键词/链接/码/草稿不落localStorage、URL或埋点。

反馈展示顺序固定“有效、链接失效、年代久远、不全”，只显示四类/total。计数不等于下载次数或真实性结论。更新内容前提示旧票会清除；任何反馈不触发处罚/举报页面。资料负责人经微信交来的资料仍由运营手工录入，本模块没有系统内投稿队列。

## 4. 独立验证与真实联调

可以用正式examples的成功、错误、schema反例建立测试专用传输层；同步运行契约校验，不能只把happy-path手写到Mock。覆盖旧响应目标不符、反馈汇总错误、published允许update、privacy404、201重放、413/415、409全分支和切换操作者等有意义行为。

原[RP-I02–09、I12–14、I17–18](../../../design/resource-plaza-v1/delivery.md)中管理端项作为验收映射。按源码AGENTS执行 `pnpm format`、`pnpm check`、`pnpm build`（pnpm10）；本轮没有执行这些应用检查。

真实联调需后端提供相同manifest的已启用10接口、构建SHA/base URL、两允许角色及拒绝角色、分类/资料/反馈样本。页面测试中的模拟不能证明PG事务或真实上架成功；正式二维码和微信真机不是本端页面开发的前置条件。

提交前交接：源码精确SHA、消费manifest SHA-256、完成界面/操作、检查结果、真实/模拟边界与未完成项；过程产物进入本端milestones/validation。当前静态证据为[工作包检查记录](../validation/2026-10-29-resource-plaza-contract-r1.json)，不代表RP-A01实现完成。
