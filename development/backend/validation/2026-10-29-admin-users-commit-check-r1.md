# 后台用户查询提交检查补证 r1

日期：2026-10-29。关联 UM-02、REQ-018/020；源码 `develop` / `ca9f68ac51285dafee88431d7610d9856e394985`，docs `backend-develop` 基点 `3412a7549e69bd38125e1a7dd401a743adcbe309`，契约 `admin-users/1.0.0`。

对应[提交与启动记录](../milestones/2026-10-29-admin-users-commit-start-r1.md)，SHA-256 `fa1612a7e19b4f05b72af1b85fefba633324aba862d54204dba88b079fce3999`；其[脱敏证据](2026-10-29-admin-users-commit-start-r1.json) SHA-256 `477cb694af5dbc390d203caf8457b4d85448270b098acad5ae800f23718ad0ea`。上述文件已固定，本补证不改写原记录。

【事实】原记录所述 `git diff --check` 预检通过时，新日志尚未暂存；该命令不覆盖未跟踪文件。提交前进一步执行 `git diff --cached --check`，发现[原始集成日志](2026-10-29-admin-users-integration-r1.txt)中的 Docker Compose 输出带行尾空格，首次暂存区检查因此失败，文档提交尚未执行。该日志 SHA-256 为 `477460748ac5054f82188b02571c8fc22dac2350b91aff738228cd7ddebe3a82`，已经登记固定，不允许修剪空格或重算指纹。

【处理与取舍】在同目录 [.gitattributes](.gitattributes) 对唯一文件 `2026-10-29-admin-users-integration-r1.txt` 设置 `whitespace=-blank-at-eol`，允许保存原始工具输出的行尾空格。其他空白规则、其他证据、源码及 Markdown 检查保持原配置。保留逐字节原始证据，不把日志清洗冒充原始输出。

【实际验证】应用该文件属性后，`git diff --cached --check` 已通过；`git check-attr whitespace -- development/backend/validation/2026-10-29-admin-users-integration-r1.txt` 返回 `-blank-at-eol`。原始日志及所有已固定记录指纹保持一致。加入本补证、固定清单追加项和属性文件后，再执行完整文档检查与暂存区差异检查，检查通过才提交。

本补证仅说明归档证据的提交检查范围与文件属性，不变更后端实现、运行配置或原真实/模拟验收边界。
