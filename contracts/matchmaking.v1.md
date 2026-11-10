# 包分配活动协议 v1

本版本依据2026-11-09用户“按计划实施”的授权。旧源码仅作行为参考：`bdtmini`、`bdtadminsvr`、`bdtsvr`。首版为男女配对、人工审核与配对、每天一项任务；不导入旧数据，不新增聊天或完成打卡。

## 领域与授权

活动独立于心愿。使用既有学生会话、学生认证、账号限制、拉黑和注销屏障；后台仅审核运营和超管可管理。学生卡原图、openid和平台账号ID不出现在对方资料中。本人资料和联系方式以信封密文保存；对方仅在配对发布、活动开始且双方资格仍有效时读取经过审核的资料。

活动配置含报名开始、报名截止、结果最早发布时间、任务开始、活动结束；开始报名早于截止，截止不晚于结果时间，结果时间不晚于任务开始，最后一日解锁早于活动结束。按北京时间自然日解锁。活动草稿可修改，发布后时间与说明冻结。报名期间允许保存和撤回；保存重新进入待审核，拒绝原因可见。截止后只能撤回未发布配对的报名或退出已发布配对，不能修改评分资料。资料提交先使用现有双词库检查，需人工复核的风险文本不进入配对资料；所有报名仍须运营人工通过。

同活动同账号一份报名，同活动每人最多一个有效配对。人工设置配对只能选择已通过审核、当前认证有效、没有限制且彼此未拉黑的报名。评分版本为`legacy-fixed-v1`，MBTI/年龄/校区/身高/体重权重30/20/25/15/10，修复旧区间上限错误；分数仅作推荐参考。配对发布冻结评分和双方报名版本。解除/退出立即撤销对方资料与任务访问；重新配对使用新关系和任务。

## 任务

模板分线上/线下，每个固定日期最多一项，其他日期从未使用的随机模板无放回抽取。发布前校验全部日期有任务，题库不足拒绝发布。任务内容和完整解锁时间在配对发布事务中固定，GET不生成或修改任务。未来任务只返回日期、锁定状态，不返回正文。双方各自记录首次查看时间，唯一键保证重复或并发请求不覆盖。活动结束后保留已发布且未解除配对的只读历史；停止新查看写入。账号受限、注销或双方拉黑时隐藏对方资料和任务正文，仍允许本人退出。

## 接口

统一前缀`/api/v1`，响应沿用`code=0`与`request_id`。写操作必须携带`Idempotency-Key`，结果未知时原键原请求重试；更新必须提交`expected_version`。列表按页读取，`page`默认1，`limit`默认20、最大50。

| 路径 | 用途 |
| --- | --- |
| `GET /matchmaking/activities` | 已发布活动列表 |
| `GET /matchmaking/activities/:id` | 本人活动、报名、配对和任务状态 |
| `PUT /matchmaking/activities/:id/enrollment` | 提交/更新报名 |
| `POST /matchmaking/activities/:id/withdraw` | 撤回或退出，允许受限账号执行 |
| `POST /matchmaking/activities/:id/tasks/:task/open` | 幂等记录本人查看 |
| `GET/POST /admin/matchmaking/activities` | 活动列表/创建 |
| `GET/PUT /admin/matchmaking/activities/:id` | 活动工作台/修改草稿 |
| `POST /admin/matchmaking/activities/:id/publish` | 发布活动 |
| `POST /admin/matchmaking/activities/:id/cancel` | 取消活动并撤销访问 |
| `PUT /admin/matchmaking/activities/:id/templates` | 保存完整任务模板，已有发布配对时冻结 |
| `POST /admin/matchmaking/activities/:id/enrollments/:enrollment/review` | 通过/驳回报名 |
| `GET /admin/matchmaking/activities/:id/candidates/:enrollment` | 合格候选与分项评分 |
| `POST /admin/matchmaking/activities/:id/pairs` | 建立待发布配对 |
| `POST /admin/matchmaking/activities/:id/pairs/:pair/end` | 解除配对，必须填写原因 |
| `POST /admin/matchmaking/activities/:id/results/publish` | 原子发布本活动全部待发布配对 |

活动承载上限为1000份报名，事务按活动及完整参与账号集合统一锁序；容量扩大前需专项验证。页内数据和总数属于同一读取快照。截止、版本冲突、未知对象、跨活动访问、权限与重复占用必须返回明确错误，不用空成功掩盖失败。

## 数据与版本

所有标识使用规范UUID字符串，时刻使用带时区的RFC3339字符串。活动状态为`draft/published/cancelled`，派生阶段为`draft/cancelled/upcoming/registration/matching/active/ended`。报名状态为`pending/approved/rejected/withdrawn`，配对状态为`draft/published/ended`。

活动输入字段为`title/description/campuses/registration_opens_at/registration_closes_at/results_at/starts_at/ends_at/days/expected_version`；名称最多80字符、说明2000字符、天数1—30。校区使用`wushan/university_town/international`。活动输出额外包含`id/version/status/phase`；更新请求不回传只读字段。

报名输入为`{expected_version, profile}`。资料包含姓名、性别、学历、年级、校区、MBTI、年龄/身高/体重及各自期望上下限、微信号、自我介绍和同意标记。性别为`male/female`，学历为`本科生/研究生/博士生`，年级来自现有受控年级资源。年龄18—80、身高100—250厘米、体重50—500斤，各区间上下限使用相同范围。姓名最多32字符、微信号64字符、自我介绍500字符，必须同意向有效配对对象展示资料。报名输出含`id/version/status/reason/profile?/eligible`，`eligible`表示当前可参加新配对，不替代平台学生认证状态。

| 写入对象 | `expected_version`来源 |
| --- | --- |
| 新建活动、新建报名 | `0` |
| 更新/发布/取消活动、保存模板、建立配对、发布结果 | `activity.version` |
| 修改报名、审核报名、撤回/退出 | `enrollment.version` |
| 解除配对 | `pair.version` |
| 查看任务 | 不传版本，空对象`{}` |

模板保存为`{expected_version, items:[{kind,body,fixed_day}]}`，最多30项、每项正文1000字符；`items`必须为数组，只有显式空数组表示清空，遗漏或`null`拒绝。`kind`为`online/offline`，`fixed_day=0`表示随机模板，正值对应活动第几天。原因最多200字符；驳回和运营解除必须填写原因。写成功统一返回`{id}`技术回执，两端重新GET读取当前状态；结果未知时必须保留原请求和原幂等键，当前会话内离页重入也不换键。

学生详情为`{activity,enrollment?,pair?,tasks}`。有效配对包含`peer`和`accessible=true`；不可访问时不返回对方资料和任务正文。任务包含`id/day_index/unlocks_at/can_open/opened_at?`，仅解锁且当前授权有效时包含`kind/body`。

后台工作台为`{activity,enrollments,total,pairs,pair_total,templates,templates_locked}`；报名与配对均按当前页返回。`templates_locked`表示活动曾发布过任务，不能根据当前页或现存个人配对推断，注销删除全部配对后仍为真。退出或注销实际解除配对时推进`activity.version`，旧版本的批量发布必须重新读取。后台配对包含报名引用`enrollments`、对应姓名`member_names`和评分；不返回平台账号ID。候选返回`{items:[{enrollment,score,score_details}]}`，稳定排序后最多50项。评分分项为`mbti/age/campus/height/weight`，算法版本固定为`legacy-fixed-v1`。

## 验收与发布

覆盖报名修改重审、截止边界、重复与并发配对、批量发布原子性、模板不足、未来正文隐藏、跨年解锁、双方并发查看、拉黑/处罚/注销后撤权和原请求重放。先执行新增版本迁移，再发布后端与隐私worker、管理端、小程序，最后开放活动。停用活动和回退应用时保留已产生的数据；历史导入与生产操作另按实际数据和目标环境执行。
