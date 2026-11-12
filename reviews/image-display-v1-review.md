# 图片加载加速审查（2026-11-12）

范围为非CDN图片加速：有界密文缓存、心愿展示规格、新头像尺寸、小程序懒加载/下载队列和后台按需原图。用户已授权审查、修复、提交、推送、部署与微信开发版更新。

## 发现与修复

| 问题 | 影响与修复 | 回归证据 |
| --- | --- | --- |
| 合并回源的发起请求取消 | 有效的等待者会继承取消结果。等待者现在仅在发起者取消时重新竞争读取，供应商普通失败不循环重试 | 先复现失败，`TestImageCacheLeaderCancellationDoesNotFailReader`修复后通过 |
| 回源函数异常未释放在途条目 | 同键后续读取可能持续等待。异常统一归为不可用，删除在途条目并通知等待者 | `TestImageCachePanicDoesNotPoisonKey`验证异常后可以重新读取 |
| 旧可见性监听回调跨页面显示周期 | 隐藏后重新进入，断开的旧监听仍可发起重复下载。监听增加独立代次，断开、离页和卸载立即使旧回调无效 | 先复现额外请求，`tests/wish-images.test.ts`修复后验证旧回调不新增下载 |

发布制品检查另发现本地微信构建继承调试API；发布时显式使用生产API重新构建，核对AppID、`isDev=false`和`useMock=false`，不更改本地联调配置。

## 源码与验证

- 后端：`ed6a06ef970cb582102fb21005e72325f1fc3a7c`。`make fmt`、`make check`（格式、vet、全量race/cover）和`make build`通过；缓存专项race回归通过。隔离原生PostgreSQL/Redis的`wish_lifecycle`两项及`studentauth`一项通过，供应商使用合成适配。
- 管理端：`5b688eab04ab8ccc3d21551c9a701887b10c288f`。本轮图片实现的`pnpm format/check/build`通过，内容图片四项行为测试通过；审查未新增管理端修改，发布重新执行`pnpm build`。
- 小程序：`85bec5def411da95d4f9b0b3d115aaee35726f2d`。最终`npm run check`的353项测试、微信构建与独立生产API配置构建通过。

三端源码均已推送`origin/develop`。图片读取前后仍检查当前权限，客户端不持久复用私有图片；不改变原图、学生卡处理、主密钥、删除账本或已应用迁移。最终部署和上传结果分别记录在[后端现状](../development/backend/README.md)、[管理端现状](../development/admin/README.md)、[小程序现状](../development/miniprogram/README.md)。

现有自动化未发现剩余阻断项；生产正式岗位写入、微信真机观察器/原生预览返回、弱网及目标容量仍需实际验收，不能以合成图片体积或本地检查替代。
