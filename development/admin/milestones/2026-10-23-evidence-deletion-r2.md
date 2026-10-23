# T032 隐私后端启用后的接口与页面联调 r2

日期：2026-10-23（Asia/Shanghai）。关联 T032、REQ-018、REQ-019；本次按用户确认的“暂无，先验证现有接口和管理端”范围交付。隐私路由启用、负向协议与页面回归验证完成，不代表真实永久删除和清理闭环验收。

## 分支、基点与提交

- 管理端 `develop`，基点 `871b9341c57f41fdd9d179af556bdf3e04120bf5`，开始时工作区干净。
- 模块一：`2ee144f592c2401d8a956efc6705018859a08468`，统一匿名回执格式校验及服务边界测试。
- 模块二：`9c8d358727bd73b88df06522a45e2e2bf7385ba4`，页面复用校验、禁用非法查询、区分只读查询失败与删除写入结果；依赖模块一。
- docs 独立工作树 `docs-admin-develop` 的 `admin-develop`，基点 `24967695b0afa789e091116feb3ef605eec3c2e9`，开始时工作区干净。原 docs 的 `backend-develop` 保留后端工作，未切换或改写。
- 核对后端 `develop` 的 `0b2a71a5857ae47971e0ff1215033002d3f6eddf`。最新提交补齐隐私独立资源与联调启动；本次只读核对后端 `internal/httpapi/privacy.go`、`internal/privacy/service.go`、`internal/privacy/cleanup.go`、`internal/moderation/crisis_read.go`、`internal/devapp/privacy.go` 及 README，未修改后端。
- 固定共享契约仍为 `0.2.0 revision 5`，原字节保留。后台 `/admin/evidence-deletion-jobs/{id}` 是后端已实现辅助端点，按安全投影消费，不声称发布新共享契约。

## 最新接口核对结论

| 接口 | 核对结果 | 本次真实联调 |
| --- | --- | --- |
| GET `/api/v1/admin/evidence/{id}` | 危机授权读取，返回证据条目 ID、关联危机案号、证据范围版本及材料；前端仅保存元信息 | 超管查询不存在的随机 UUID 返回 404；危机列表 200 且为空 |
| DELETE `/api/v1/admin/evidence/{id}` | 超管、Bearer 和 Idempotency-Key；仅 reason/expected_version，理由非空且 UTF-8 最多 2000 字节；202 为 id/version/pending 待办，不能称已删完 | 未登录 401；已确认不存在的随机 UUID 返回 404；缺幂等键、错误版本、多余字段、中文字节超限均 400；未删除实际对象 |
| GET `/api/v1/admin/evidence-deletion-jobs/{id}` | 超管读取最小 processing/completed 与安全重试提示；禁止查询参数 | 未登录/无效令牌 401，超管未知待办 404，查询参数或非法 UUID 400 |
| GET `/api/v1/deletion-receipts/{receipt}` | 匿名高熵访问凭据，不带后台令牌、不带查询参数；格式为 UUID 与 URL 安全校验串 | 合成无效回执、裸 UUID 均 404；附加查询参数 400 |

上述隐私处理器真实响应均有 `Cache-Control: no-store`、`Pragma: no-cache`、`Referrer-Policy: no-referrer`。本轮确认 EvidenceDeletionDSN、PrivacyDSN 均已配置，只记录是否存在，不记录连接值。19 项 HTTP 检查（含 Vite 可达性、登录和退出）均符合预期；完整路径、状态、缓存头与请求关联标识见[真实接口证据](../validation/2026-10-23-evidence-deletion-r2.json)。证据中的 UUID 和无效校验串均由验证脚本生成，不是实际证据或用户回执。

证据 GET 后端还接受范围 ID 别名，但返回规范证据条目 ID；管理页明确输入条目 ID 并保留响应绑定检查。本轮未放宽跨目标绑定或编造范围版本；非危机证据范围的可读版本入口仍待后端契约提供。

## 页面问题与修复

【复现事实】在已有 5173 页面输入 `not-a-receipt` 并查询，服务层阻止请求，但页面显示“写入结果不明确”的通用错误，混淆只读查询与删除动作。

【修复】服务层导出并复用回执校验；页面对不完整回执显示明确格式提示并禁用查询，表单处理函数再次检查，不能以直接提交绕过。查询 HTTP 400 要求核对参数；404 不认定完成；网络失败提示“查询未完成，请稍后重试”，不再引入删除写入风险提示。删除提交本身的幂等与结果不明确语义保持。

【可测试验收】裸 UUID、非法标识、过短/过长/多段/带 padding 的校验串不能发起查询；合法校验串原样传输且不带后台令牌。格式修正后才可查询；查询错误不触发 remove、不显示写入不明确；后端只读错误不泄漏内部正文。对应相邻服务和页面回归全部通过。

【浏览器事实】复用用户已有 `http://localhost:5173` 代理 18080 服务；没有另启 Vite。真实后台登录、超管入口、格式校验、匿名回执和待办 404、证据 404 不出现删除控件、清空输入及退出均验证。测试会话已退出，口令和令牌只在内存使用。截图见[格式校验修复](../validation/2026-10-23-evidence-deletion-receipt-validation-r2.png)和[真实待办反馈](../validation/2026-10-23-evidence-deletion-browser-r2.png)；没有实际回执或正文。

## 质量检查、证据边界与剩余验证

- 本轮重新执行 `pnpm format`、`pnpm check`、`pnpm build`，全部通过。25 个业务测试文件、291 项业务测试、58 项规范检查器测试通过，格式、零警告 ESLint、严格类型和 Vite 构建通过。迭代中的测试文件编辑错误恢复后完整重跑，未删除既有测试、降低规则或引用旧运行快照。见[完整最终日志](../validation/2026-10-23-evidence-deletion-quality-r2.txt)。
- 源码 `git diff --check` 通过；docs 执行 `python3 scripts/check_documents.py` 及包含新文件的暂存差异检查，新增阶段产物交付时追加固定清单。精确源码文件与 SHA-256 在上述 JSON 中。
- 运行路径没有 Mock 或虚构资料。测试文件里的隔离响应只支持行为回归，不冒充真实后端业务闭环。
- 用户确认暂无可处置测试证据与有效回执。本次不执行实际证据删除或本人注销，不构造数据库夹具、不伪造回执、不操作真实案件。真实 202、幂等成功回放、409 并发、有效回执 200、processing/completed 状态及物理清理未验证；无低权限测试账号，真实 403 场景未执行。
- 后端开发隐私 worker 未注入真实外部全版本清理和脱敏适配器，源码明确会保持 processing。路由启用不能推断外部清理完成；不宣称生产、备份重删或三端联调验收通过。

本记录补充[前阶段](2026-10-23-evidence-deletion-r1.md)，其 SHA-256 为 `ff3949cdd0e1575eff36f42d4f58446f506d86631e2485f02031ac1116f9fb9d`。前阶段“隐私路由未启用”为当时事实，本轮新证据确认已启用，既有文件和固定条目保持原样。共享进度台账由 docs 协调者维护，本次只更新管理端索引及新增记录。
