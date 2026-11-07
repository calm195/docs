# 双词库审核增量 v0.2.1-r2

本增量继承[词条状态增量](wordlist-entry-status.v0.2.1-r1.md)。自定义词库保留危机、涉校和普通违规三类。内置词库为第四种快照类型 `builtin`，来源是固定版本的 go-swd 词表。两类词库在同一次扫描中生效。

## 管理接口

路径均相对于 `/api/v1/admin`。权限沿用词库管理岗位，写入沿用幂等键和版本校验。

| 方法与路径 | 输入与结果 |
| --- | --- |
| `GET /wordlists/:id/entries` | 按 `q`、`label`、`disposition`、`enabled`、`offset`、`limit` 筛选和分页读取指定内置快照。返回 `items`、`total`、`labels`、`upstream_version`。 |
| `GET /wordlists/:id/upstream-changes` | 分页比较指定内置快照和当前安装的上游基线，返回新增、移除、默认处置变化及覆盖冲突。被上游删除的词条如仍有本地覆盖，需先处理冲突。 |
| `POST /wordlists/builtin/versions` | 以 `expected_version` 为基准新建内置草稿。可传 `overrides`（按词条 ID）和 `label_overrides`（按标签）调整 `enabled` 或 `disposition`。`refresh_upstream` 请求导入当前构建的上游基线。 |
| `POST /wordlists/:id/preview` | 请求含 `text`。返回 `effective` 和 `draft`，分别表示当前生效组合和将本草稿替换同类生效快照后的组合。每组含 `matches`、`routes` 和可选 `truncated`。仅审计操作，测试文本不持久化。 |
| `POST /wordlists/:id/restore` | 请求含 `expected_head_version`。将指定归档版本复制为同类新草稿。草稿通过现有发布接口显式发布。 |

内置默认高、中风险为 `review`，走普通违规复核。其他标签默认 `hint`，仅记录提示。停用规则只作用于所属词条；同词在另一个来源或类别仍可独立生效。危机、涉校及私密来源继续按现有业务规则流转。

## 授权审核详情

普通内容和悄悄鲤的授权详情可返回 `wordlist_evidence`，包含 `engine_version`、`builtin_version`、`crisis_version`、`school_version`、`ordinary_version` 和 `matches`。自动危机命中的证据仅出现在已有授权危机详情或证据接口。历史扫描可能省略该字段。

每个命中包含 `word`、`source`（`builtin` 或 `custom`）、`kind`、可选 `label`、`disposition` 和 UTF-16 半开区间 `start`、`end`。审核证据中的 `field` 指示位置所属的 `body`、`title` 或 `reward_text`。命中明细可以截断，截断不影响实际审核流转。
