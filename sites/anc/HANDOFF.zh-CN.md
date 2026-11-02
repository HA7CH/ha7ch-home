# ANC 官网发布说明

正式地址：**https://ha7ch.com/ai-native-company**。

网站通过 `HA7CH/ha7ch-home` 的 Next.js 路由发布，沿用 `master` 分支的 Vercel 自动部署。本次无需 Worker 接入或 DNS 修改。

- 可编辑页面位于 `sites/anc/dist/`；生成包位于 `sites/anc/release/`。
- `src/app/ai-native-company/route.ts` 导入生成的完整 HTML、CSP 和版本 hash，处理新页面的 GET/HEAD。
- 原 `/anc` 重定向和 `/anc/01` 页面保留。
- 中英文、老板/中层/员工视角、硬件、Dojo、任务示例和 FAQ 都在同一页面中。

更新内容后重新 build/check/test，提交源码与生成物，通过 PR 检查后合并到 `master`。Vercel 发布完成后，从 `sites/anc` 执行：

```bash
node operations/verify-live.mjs https://ha7ch.com/ai-native-company
```

再检查桌面、手机和页面交互，以及主站首页、`/anc` 和 `/anc/01` 的原有行为。完整步骤见 [部署 SOP](DEPLOYMENT.zh-CN.md)。

独立的 `anc.ha7ch.com` Worker 已有源码 `worker/worker.mjs`、[维护说明](worker/README.md)和[历史发布记录](RELEASE-2026-11-02.md)。本次只发布主站新路径，不修改或部署该 Worker；其版本按独立发布记录维护。
