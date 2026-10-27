# 公开主页提交检查补充说明

本记录勘误[精确源码提交补充](2026-10-27-public-profile-commit-r1.md)，原文件SHA-256为`7b1af9cd44bba9f69c05dc7b6930df2cd42b8e1d94c5907a12ac3aea3d4eaff8`。源码提交仍为`cf09310a4f1c19c7eb02e7a2dabcddd2804866c9`，分支`develop`；docs分支`backend-develop`，基点`612396b991b863cb180781ff87e7ab646d5d6a4f`。沿用OpenAPI 0.2.0/revision 5，关联REQ-008、REQ-018，不修改应用行为或业务验收结论。

首次暂存完整文档后，`git diff --cached --check`发现固定原始Docker集成输出含行尾空格。先前工作区`git diff --check`没有覆盖未跟踪文件，因此不能作为这些新增日志的暂存检查通过证据。原日志及既有固定指纹保持不变。

新增`.gitattributes`只为`development/backend/validation/2026-10-27-public-profile-integration-r1.txt`设置`whitespace=-blank-at-eol`，保留原始工具输出；其他文件及其他空白规则不放宽。补充配置后复跑`git diff --cached --check`、`git diff --check`和`python3 scripts/check_documents.py`，结果随提交最终核对。不重跑内容未变的应用测试，不推送、合并或部署。
