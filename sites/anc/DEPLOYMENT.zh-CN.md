# ANC 官网部署 SOP

正式地址：**https://ha7ch.com/ai-native-company**。发布仓库为 `HA7CH/ha7ch-home`，沿用主站 `master` 分支的 Vercel 自动部署。

本次新增独立产品页，保留现有 `/anc` 重定向和 `/anc/01` 页面，也不修改主站其他路由。无需 DNS、Cloudflare Worker、账号权限或数据迁移。

## 1. 修改与生成

可编辑文件位于 `sites/anc/dist/`。`scripts/build.mjs` 将样式、脚本和图标内联为完整文档，生成 `release/anc-homepage.mjs`、`release/anc-standalone.html` 与 `release/manifest.json`。

在独立工作分支中修改，保持其他人的工作不变。每次源码变更后，在仓库根目录执行：

```bash
npm --prefix sites/anc run build
npm --prefix sites/anc run check
npm --prefix sites/anc test
npm run test:anc
```

子项目无需安装依赖，要求 Node.js 22 或更新版本。主站依赖沿用仓库既有安装方式；发布前运行主站要求的检查和 `npm run build`。源码和重新生成的 release 文件一起提交，不手工修改生成物。

## 2. 路由与响应边界

`src/app/ai-native-company/route.ts` 直接导入生成模块的 HTML、CSP 和 SHA-256。它通过 Next.js 的精确路径提供 GET/HEAD，不调用旧 Worker 根路径处理器。

| 请求 | 预期行为 |
| --- | --- |
| `GET /ai-native-company` | 返回完整 ANC 产品页 |
| `GET /ai-native-company?lang=zh` | 返回相同文档，由前端选择中文 |
| `HEAD /ai-native-company` | 同样响应头，无响应体 |
| `/anc` | 保持原重定向 |
| `/anc/01` | 保持原页面 |
| 主站首页及其他路由 | 保持原行为 |

新页面设置 `Cache-Control: no-store`、精确的脚本/样式 hash CSP、`nosniff`、referrer policy，以及 `X-ANC-Site-Version` 内容 hash。不要给这一响应追加会拦截现有资源的 CSP，也不要转换内联脚本或样式的字节。无需增加 `/style.css`、`/app.js` 或 `/assets/*` 路由。

## 3. 预览与合并

用主站的开发或 Vercel PR 预览地址打开 `/ai-native-company`。独立 `npm --prefix sites/anc run dev` 只在本地根路径预览生成文档，不能代替主站集成检查。

验收以下项目：

- ANC / AI Native Company 首屏、老板/中层/员工入口和主站链接正确。
- 中英文切换、任务步骤、FAQ 搜索/分类/展开及键盘操作正常。
- 手机宽度没有横向溢出，浏览器没有新增脚本错误或 CSP 拦截。
- 主站首页、`/anc`、`/anc/01` 保持原页面或重定向行为。

从 `sites/anc` 检查可直接访问的预览 URL，保留完整路径：

```bash
node operations/verify-live.mjs https://YOUR_PREVIEW_HOST/ai-native-company
```

PR 检查通过后合并到 `master`，由既有 Vercel 项目自动构建和发布。记录合并 commit、Vercel 部署地址和发布前的生产部署版本。不要另建托管项目或替换主站域名。

## 4. 生产验收

确认对应 commit 的 Vercel 部署成功后，从 `sites/anc` 执行：

```bash
node operations/verify-live.mjs https://ha7ch.com/ai-native-company
```

脚本检查同一主机、同一路径的 GET、`?lang=zh` GET 和 HEAD，核对状态码、响应头、完整 HTML hash 和空 HEAD body。它不跟随重定向；传入最终 URL，不附带查询参数、片段或凭据。旧的 origin-only 用法仍可用于根路径预览。

随后用浏览器重复交互检查，并确认主站首页、`/anc` 与 `/anc/01` 的原有行为。线上版本由 `X-ANC-Site-Version` 与 `release/manifest.json` 对照。构建成功或 PR 合并本身不代表线上验收完成。

## 5. 回滚与发布记录

如新页面或原有主站路径出现回归，沿用既有 Vercel 回滚流程恢复到发布前记录的明确版本。源码侧撤销本次集成提交，避免后续部署重新带回问题；不要覆盖其他人之后的修改。回滚后重新检查主站首页、`/anc` 和 `/anc/01`。

发布记录只需包含：生产 URL、合并 commit、Vercel 部署版本、`X-ANC-Site-Version`、交互与原有路径检查结果，以及可回滚版本。不要记录 token、Cookie 或私有配置。

## 兼容说明

`integration/homepage-handler.mjs` 与 Worker 示例保留原有根路径及主机白名单边界，仅供旧方案兼容。本次 `/ai-native-company` 的发布无需使用它们，也不要求接入原 ANC 子域名服务。
