# 资料广场管理端本地真实联调 r1

日期：2026-10-29（Asia/Shanghai）。任务 RP-A01；关联 REQ-023、REQ-018、REQ-019。状态：本地管理端与实际后端浏览器联调通过，已确认小程序反馈汇总；未提交或推送。

## 范围与基点

源码 `develop / 305b004ddd9a0d2c6fab16d6a8a23cd932320167` 为未提交工作区基点，docs `admin-develop / 83945210cb5f9882f4ab3d142a6c004cfacf5fd9`。本轮没有修改源码，17 个实现文件与[上一轮最终实现证据](../validation/2026-10-29-resource-plaza-admin-r2/result.json)指纹一致。[原实现补证](2026-10-29-resource-plaza-implementation-r2.md) SHA-256 为 `e268d184a5f823a5ef731c04ef54c826d6baa592e63ae05a026314024bff4e09`，保持原样。

采用 [resource-plaza/1.0.1](../../../contracts/resource-plaza-v1-r2/README.md)，manifest SHA-256 `e577c9706f2ab90f000ca26a556ffb0e6c9c5cf9c9ead0dfe2a086e1c6c2489f`。Vite 实际监听 `http://127.0.0.1:5173`，同源 API 代理至本机 `18080`。后台凭据从后端 `.local/local/admin-login.txt` 静默读取，不复制值、不重置账号。

## 实际验证

使用本机 Chrome 运行真实 Vue 页面与真实 HTTP，没有拦截或合成 API 响应。

- 管理员登录、创建分类、保存资料草稿、显式上架成功。
- 已上架资料先下架再编辑；内容保存后仍为下架，内容版本递增；再次显式上架成功。
- 标题片段模糊搜索返回对应资料；已引用分类停用得到真实 `409 CATEGORY_IN_USE`，界面显示正确说明。
- 小程序完成反馈后，管理端重新登录并读取列表、详情，确认当前 `content_version=2`，总计 `1`、不全 `1`、有效/链接失效/年代久远均 `0`；[最终汇总截图](../validation/2026-10-29-resource-plaza-live-r1/feedback-summary.png)。页面无运行错误。

保留联调分类 `5bfdc302-e926-4312-b2c0-d88b072d9afd` 与资料 `624595a5-aab4-4349-90fe-d3f2e2000a90`，标题为“本地联调资料 20261029113754”；最终上架、资料版本 `5`、内容版本 `2`。这些是明确标记的本地联调数据。

[脱敏证据及源码指纹](../validation/2026-10-29-resource-plaza-live-r1/result.json)、[创建分类](../validation/2026-10-29-resource-plaza-live-r1/category-create.json)、[管理流程](../validation/2026-10-29-resource-plaza-live-r1/browser.json)、[反馈查询](../validation/2026-10-29-resource-plaza-live-r1/feedback.json)。首轮脚本精确标签选择器不匹配导致等待超时；修正测试选择器并复用已创建分类后完成流程，不是应用错误。反馈截图补采了抽屉动画结束后的画面。

## 环境与边界

后端协调者本轮确认既有 Docker `liyuanci-local` 环境显式迁移 `28→29` 并补权限后启动。该本地环境复用单 DSN，本次真实浏览器通过不能证明生产独立数据库身份权限隔离。下载地址使用 `example.com` 演示值，未验证真实网盘可用性；业务数据为本地联调样本。微信开发者工具内操作由小程序端独立记录，本管理端证据不等同微信真机或生产验收。

管理端服务继续运行供用户联调。本轮没有代码修改，未重复全量构建；完成源码指纹核对、docs 文档检查及 `git diff --check`。新记录和证据追加固定，不改旧记录。
