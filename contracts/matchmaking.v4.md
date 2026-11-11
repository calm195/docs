# 包分配活动协议 v4

本版在 [v3](matchmaking.v3.md) 的独立资料中增加理想型特质。接口沿用 `/api/v1`、学生/后台会话、统一响应及写命令幂等键。特质不参与既有配对评分。

## 资料与词条

- 保存 `PUT /matchmaking/profile` 时，`profile.ideal_traits` 为词条文本数组。省略保留已选内容，空数组清空；最多 10 项，每项规范化后 1～20 个 Unicode 字符。统一全半角、去除首尾空白并去重，同名词条跨账号复用。
- 保存时创建尚不存在的词条，并以当前有效词库检查。未命中有效词库的词条直接 `approved`；命中时以 `pending` 保存并保留命中依据，不阻塞其他资料保存。词库依赖不可用时整个保存失败，不能绕过审核。
- `GET /matchmaking/profile` 增加顶层 `trait_selections: [{id,name,status,reason}]`，仅本人可读全部选用及其状态。`profile.ideal_traits` 只返回已通过词条文本，报名预览和配对资料也只展示已通过词条。
- 已选词条的审核状态为 `approved`、`pending`、`rejected`。待审核通过后生效，驳回后本人可删除；推荐和默认统计不返回待审核或驳回词条。
- 新报名将当时已通过的特质写入加密报名快照；之后修改本人标签或审核通过不改写既有快照。历史无特质的资料和报名按空列表展示。
- 词条与选用关系并发去重；保存沿用专用资料 `expected_version` 和原请求重试语义，重复保存不重复增加热度。

## 输入推荐

`GET /matchmaking/traits?q=文本&limit=10` 返回 `{items:[{id,name,heat}]}`。需要学生会话，仅返回已通过词条，按文本匹配和热度推荐。用户确认输入才形成标签，键入过程不创建词条。

## 管理端列表和词云

`GET /admin/matchmaking/traits` 支持以下查询：

| 字段 | 语义 |
| --- | --- |
| `q` | 词条文本搜索 |
| `gender` | `male`、`female`、`undisclosed`；省略表示全部。指当前选用者的性别 |
| `status` | `approved`、`pending`、`rejected`，默认 `approved` |
| `min_heat`、`max_heat` | 当前筛选性别下的去重选用人数区间 |
| `sort` | `heat_desc`、`heat_asc` |
| `page`、`limit` | 列表分页 |

返回 `{items,total}`，词条包含 `id,name,status,version,heat,male_count,female_count,undisclosed_count,created_at,reason`。热度统计当前有效账号的选用关系；移除标签、账号注销或性别变化反映在下一次读取中。各性别人数反映对应分组，总热度根据性别筛选计算；指定性别时只返回该性别选用人数大于零的词条。

`GET /admin/matchmaking/traits/cloud` 使用相同业务筛选，不接收 `page`，`limit` 最大 100，返回 `{items:[{id,name,heat}],total}`。词云直接查询全部符合条件的聚合结果，不依赖列表当前页；界面显示截取上限，字号按热度变化。

## 审核

- 管理端沿用包分配岗位权限，由服务端复核 `review_operator` 或 `super_admin`。
- `GET /admin/matchmaking/traits/:trait` 返回词条详情及 `evidence`。命中依据包含 `matches` 和 `routes`，命中项含 `word,source,kind,disposition,start,end`，可附 `label,field`；截断通过 `truncated` 标识。
- `POST /admin/matchmaking/traits/:trait/review` 接受 `{expected_version,decision,reason}`，`decision` 为 `approved` 或 `rejected`，返回 `{id}`。审核保存操作人、时间和原因；驳回必须填写原因，说明最多500字，过期版本不能覆盖新结果。审核结果推进所选账号的账号资料版本，旧报名预览须重新读取确认。
- 仅 `pending` 可以审核，已通过与驳回为本版终态。词条审核独立于活动报名审核，本版不提供词条重审和撤销通过操作；词库更新不自动重扫既有特质词条。

## 升级和验证边界

先显式应用 `0025_matchmaking_traits` 迁移，再更新后端和两端。普通 API 启动不执行 DDL，不清空现有开发数据。测试需覆盖并发去重、旧客户端省略字段、审核状态隔离、报名快照、热度与性别变化、权限、注销清理和词云/列表口径一致。生产部署与微信真机验收另行记录，不能用本地联调替代。
