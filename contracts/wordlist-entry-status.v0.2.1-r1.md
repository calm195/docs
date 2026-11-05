# 词条状态增量 0.2.1-r1

适用于管理端词库。在 [OpenAPI 0.2.1](openapi.v0.2.1.json) 的完整版本契约上增加可选字段 `disabled_entries`。字段类型为字符串数组，是 `entries` 内不重复的子集。已有词条默认启用。

| 接口 | 增量 |
| --- | --- |
| `POST /api/v1/admin/wordlists/versions` | 请求可携带 `disabled_entries`。缺省或空数组代表完整快照内的词条均启用。未知或重复停用词条返回 400 |
| `GET /api/v1/admin/wordlists/{id}` | 返回完整 `entries`，含停用词。存在停用词时同时返回 `disabled_entries`，调用方可通过精确文本关联 |
| `POST /api/v1/admin/wordlists/{id}/publish` | 发布原子切换分类生效快照。停用项在后续词库扫描中跳过。归档版保留原有状态 |

例如，以下请求创建含两条词的草稿，其中「示例词乙」停用。

```json
{
  "kind": "school",
  "entries": ["示例词甲", "示例词乙"],
  "disabled_entries": ["示例词乙"],
  "expected_version": 7
}
```

增删、编辑和启停都是对待发布快照的词条操作。创建与发布沿用审核运营或超管权限、幂等键、分类基准、草稿版本校验和审计。已提交快照保留完整内容和状态。既有审核任务仍引用原快照，不触发历史重扫。

部署时先显式应用迁移 0010，再更新 API 与内容扫描 worker，最后发布管理端。混用旧扫描 worker 会使停用词仍参与扫描。
