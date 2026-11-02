# ANC 官网交接

正式地址：**https://anc.ha7ch.com/**。已按原计划接入现有 `anc-onboard`
Worker，仅替换首页，保留发布 API、既有网页、入职入口和 sitemap。
`ha7ch.com/anc` 的旧演示入口未修改。

- 页面可编辑源码：`dist/`
- 确定性构建产物：`release/`
- 已接入的原 Worker：`worker/worker.mjs`
- 后续维护：[worker/README.md](worker/README.md)
- 发布与回归流程：[DEPLOYMENT.zh-CN.md](DEPLOYMENT.zh-CN.md)
- 本次版本和验收：[RELEASE-2026-11-02.md](RELEASE-2026-11-02.md)

在本目录运行 `npm run build`、`npm run check`、`npm test`。使用经过核实的
现有 Worker 配置部署；不要用仓库根目录的 Vercel 流程发布这个子项目。
首页必须保留 `no-transform`，避免 Cloudflare 注入额外脚本而使构建内容与
线上响应不一致。不要改动原业务的 CSP、鉴权或 KV 绑定。
