# 共享契约导航

本页为可维护导航，关联 T002、REQ-001、REQ-018、REQ-020。正式协议和状态见[契约原入口](README.md)，本文不新增字段或实现状态。

契约 revision 5 输入指纹覆盖 README 及若干版本说明文件。这些文件保持原字节，旧开发仓库 docs/ 路径按[迁移清单](../governance/migration-2026-10-22.json)定位；旧链接不再直接使用，改从下列当前入口访问证据。

- [后端证据与运维索引](../development/backend/README.md)
- [后台/学生身份阶段证据](../development/backend/milestones/phase-05.md)
- [学生会话说明](../development/backend/student-auth.md)
- [学生卡阶段证据](../development/backend/milestones/phase-06.md)
- [人工认证阶段证据](../development/backend/milestones/phase-07.md)
- [管理端文档](../development/admin/README.md)
- [小程序文档](../development/miniprogram/README.md)

后续契约变化须新增版本或 revision，不覆盖已固定输入。历史清单对应当时版本，不推断真实业务验收通过。

## 黑名单正式增量契约

2026-10-27新增[OpenAPI 0.2.1与revision 6接入说明](blocks.v0.2.1.md)，正式收录既有黑名单列表、条目版本及解除动作归属。该增量使用独立版本文件，旧0.2.0/revision 5及指纹保持不变；其他操作的历史实现元数据不作为当前交付结论。

## 悄悄鲤首期设计契约

2026-10-27用户采纳方案并将文字树洞、互动及本人胶囊提至首期，语音延期。三端独立开发入口为[whispers/1.0.0模块契约](whispers-v1/README.md)及[详细方案](../design/whispers-v1/README.md)。该包为设计交付，所有新增接口尚未实现，不覆盖旧全站版本；匿名黑名单安全迁移属于显式兼容变更，启用前须升级已有消费者。新旧固定输入保持独立。
