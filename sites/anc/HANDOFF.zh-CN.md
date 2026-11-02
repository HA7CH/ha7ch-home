# ANC 官网发布说明

正式地址：**https://ha7ch.com/ai-native-company**。

网站通过 `HA7CH/ha7ch-home` 的 Next.js 路由发布，沿用 `master` 分支的 Vercel 自动部署。无需单独委托 Lawted 接入 Worker，也不需要修改 DNS。

- 可编辑页面位于 `sites/anc/dist/`；生成包位于 `sites/anc/release/`。
- `src/app/ai-native-company/route.ts` 导入生成的完整 HTML、CSP 和版本 hash，处理新页面的 GET/HEAD。
- 原 `/anc` 重定向和 `/anc/01` 页面保留。
- 中英文、老板/中层/员工视角、硬件、Dojo、任务示例和 FAQ 都在同一页面中。

更新内容后重新 build/check/test，提交源码与生成物，通过 PR 检查后合并到 `master`。Vercel 发布完成后，从 `sites/anc` 执行：

```bash
node operations/verify-live.mjs https://ha7ch.com/ai-native-company
```

再检查桌面、手机和页面交互，以及主站首页、`/anc` 和 `/anc/01` 的原有行为。完整步骤见 [部署 SOP](DEPLOYMENT.zh-CN.md)。

旧 Worker 接入模板仅保留作兼容参考，不参与本次主站路径的发布。
