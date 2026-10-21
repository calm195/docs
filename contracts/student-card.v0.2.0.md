# 学生卡上传与扫描接入

2026-10-21；T011/REQ-002、015、018，关联T007/REQ-020。仅上传与扫描状态两个既有操作提供implemented-injected实现；本端真实PG/Redis/HTTP隔离验证，微信/KMS/对象/扫描为合成适配器，server和cmd/worker尚未装配对应领域服务，不表示实际部署或跨端联调。

## 上传

`POST /api/v1/me/student-card-assets`，学生Bearer与Idempotency-Key，Content-Type为带boundary的multipart/form-data，且仅有一个名为file的文件部分。file部分Content-Type必须image/png或image/jpeg并与实际文件匹配；不允许额外字段/第二文件，不发送学号、姓名或客户端OpenID。不要把文件作为JSON/base64字段提交。后端不使用可落明文磁盘的ParseMultipartForm。

上传先验证字节/像素上限、真实解码和类型，再将已解码像素无损重编码PNG，去除EXIF/尾随载荷；不会再作JPEG有损压缩。源与规范化输出都受MaxBytes约束；JPG转PNG可能增大。文件名不入库，后端生成随机对象key。部署方须明确尺寸与大小，当前参数没有产品默认值；既有HTTP入口全请求1MiB上限仍适用（含multipart开销），更大的生产上传能力尚未交付。

202标准封装data例如`{"asset_id":"00000000-0000-4000-8000-000000000001","scan_status":"pending"}`。这里只表示加密暂存、工作和发件箱已共同持久化，不表示外部对象已写入或图片已通过。相同键/同规范化图片及输入媒体类型返回同asset_id和当前状态，不重复创建工作；不同摘要409 IDEMPOTENCY_CONFLICT。400为格式/大小/像素/字段错误，401会话无效，403当前受罚不能上传，429图片计算并发已满可稍后重试，503加密/数据库等依赖失败。均no-store。

## 扫描状态

`GET /api/v1/me/student-card-assets/{id}`，学生Bearer，200返回同Asset投影；pending为排队、重试或异常待办未终结，approved为图片安全扫描通过，rejected为扫描明确拒绝。未知与非本人均404；不返回外部对象key、密文、图片内容或下载URL。API不承诺扫描时限；页面按既有生命周期查询，离开停止请求，重入后从服务端读取，不用本地定时器伪造完成。

**approved不代表学生认证通过。** Verification人工申请、本人审核状态、后台案件/原卡/decision已提供implemented-injected模块，详见[人工认证](verification.v0.2.0.md)。不能因为图片扫描成功自行开放发布、应愿或聊天，也不能把Asset状态当Verification版本；服务端逐次复核资产归属/扫描、账号/处罚与审核版本。

## 动作与装配

Me.allowed_actions只有在学生会话配置StudentCardAssets=true且明确注册学生卡路由时才提示postMeStudentCardAssets；默认关闭。当前主体受罚时不提示上传，直接调用仍由根命令事务重新授权。GET不是写动作，不将GET动作名当授权。

后端需显式第十版迁移/permissions、StudentCardPayload实体注册、studentcard.New注入会话/加密器/Objects.PutOnce/Scanner，以及RegisterStudentCards；API和worker分别使用身份维护组/领域worker组的数据库池。DecodeSlots、MaxBytes/MaxPixels、独立ReceiptKey、事务/租约/重试预算全部显式给出。Objects必须同key同密文幂等且禁止覆盖不同内容，Scanner必须区分明确拒绝与临时故障，遵守context且不保留原图或日志请求正文。

## 后端处理边界

上传事务仅写信封密文暂存、私有key密文、资产和工作/技术事件；消息无图片、身份或URL。worker领取后释放数据库锁才写私有对象/扫描，最后持锁复核账号生命周期、资产版本及租约代次，原子提交状态/工作终态/回执并清除暂存。临时失败保留密文重试，预算耗尽或缺密文转待办；丢失MQ唤醒可由显式ProcessNext补偿。旧租约、重复/伪造/已替换消息不能重复产生业务效果。注销前/扫描后均可取消，不把晚到通过恢复为可用卡片。

被拒绝/取消/异常对象的实际桶清理与生产保留策略、真实供应商、业务worker进程装配和安全重驱动管理入口均待后续交付；不宣称已物理删除。实现与真实/合成记录见[后端第六阶段](../../liyuanci-backend-go/docs/milestones/phase-06.md)。
