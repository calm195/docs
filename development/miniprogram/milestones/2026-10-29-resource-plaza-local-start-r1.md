# 资料广场小程序本地启动与模拟器门禁验证 r1

日期：2026-10-29（Asia/Shanghai）。任务 RP-M01、RP-Q01，关联 REQ-023、REQ-002、REQ-018。状态：**开发监听和微信模拟器已启动；未登录门禁已验证，真实账户登录及资料业务联调未完成**。

## 输入、分支与源码状态

用户本轮要求“启动本地环境联调”。源码为 `develop / 3bcec888230a6cf3b096d2c51e3ea03ca15f9c7a` 加既有未提交的资料广场实现，本轮未改源码。docs 工作树 `/private/tmp/liyuanci-rp-docs-mini` 使用 `mini-deveop / 83945210cb5f9882f4ab3d142a6c004cfacf5fd9`，本轮记录也未提交。

本记录补充[实现与独立验证 r1](2026-10-29-resource-plaza-implementation-r1.md)，原记录 SHA-256 `44833c6530f9d02d19d892038eda43cda169d846755893f7514aabba83b8e078`；不修改其内容或状态。逐文件指纹与[原证据](../validation/2026-10-29-resource-plaza-implementation-r1.json)一致，17个文件全部核对通过；原证据 SHA-256 `88a0deeb1025f1e652cb3a2b045deffb0495b1cab57c9e20e2f9cb22d543ab4f`。当前共享契约为[resource-plaza/1.0.1](../../../contracts/resource-plaza-v1-r2/README.md)，其学生5项操作与本端消费的1.0.0完全一致。

## 实际启动与验证

1. 读取既有 `.env.local`：API为 `http://127.0.0.1:18080/api/v1`，`VITE_USE_MOCK=false`，未改公开配置或微信凭据。
2. 执行 `npm run dev:mp-weixin`，开发编译实际成功，输出 `DONE Build complete. Watching for changes...`；监听产物为 `/Users/kurous/code/liyuanci/liyuanci-miniprogram-uniapp/dist/dev/mp-weixin`，包含资料列表、详情页面。
3. 已安装微信开发者工具2.02.2608070并打开上述正确项目。CLI服务端口既有状态为关闭，未开启；通过原生界面核实项目与运行结果。既有忽略产物中的 `project.private.config.json` 已为 `urlCheck=false`，本轮未改变安全设置。
4. 模拟器首页实际显示“账号状态：未登录”和资料广场入口。点击入口进入 `pages/resources/index`，显示“登录后完成学生认证，即可查看资料。”及“前往登录”，未展示受限资料；随后进入现有微信登录页。

[脱敏证据](../validation/2026-10-29-resource-plaza-local-start-r1.json)记录命令、配置白名单、进程、页面观察、源码指纹及未验证项，不保存账户、令牌、Secret或登录请求数据。观察来自实际开发者工具UI，不是替换响应或合成页面。

## 当前阻塞和验证边界

自动审批审查拒绝了点击“微信登录”：其理由是当前请求仅明确要求启动本地联调，真实账户认证可能建立或改变会话，需要用户明确授权，不能由子代理指令扩大权限。该点击未执行；没有以CLI、HTTP或其他入口绕过拒绝。用户可在当前微信开发者工具中自行登录，或明确授权继续真实登录后再执行。

因此，本轮仅确认微信开发构建、模拟器项目加载和未登录门禁。尚未验证已认证学生的资料列表/详情请求、复制、反馈、跨端修改/下架后的可见性、微信真机和正式投稿二维码。不将后端就绪或其他端结果当作本端已完成三端联调。未改变任何现有用户认证或处罚状态。

本轮无业务源码改动，未重复全量测试或生产构建；此前194项测试属于原固定记录的历史证据。文档交付运行 `python3 scripts/check_documents.py` 和 `git diff --check`，源码也执行差异空白检查。

## 运行与停止

开发watch保留在工具持久PTY会话 `95388`；核实时npm PID为 `84016`，uni watcher PID为 `84088`。可向该会话发送Ctrl-C，或确认仍是本项目进程后执行 `kill -TERM 84088 84016`。PID只反映本次启动，不作为重启后的稳定标识。日志保留在该会话；本轮未另外创建源码日志文件。

本轮未提交、推送、合并、部署或上线；既有源文件和固定交付记录保持不变。
