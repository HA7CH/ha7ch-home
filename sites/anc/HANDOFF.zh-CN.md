# 给 Lawted 的部署交接

ANC 官网内容和设计已确认，源码与部署包都在 `sites/anc/`。

请按 [部署 SOP](DEPLOYMENT.zh-CN.md) 接到 `https://anc.ha7ch.com/`。网站采用 HA7CH 黑白设计，围绕老板、中层和员工解释 ANC = AI Native Company，包含硬件、Dojo、工作示例及双语 FAQ。

已经准备好：

- 可编辑静态源码和中英文内容。
- `release/anc-homepage.mjs` 单文件模块，内含完整 HTML、样式、脚本和图标。
- 精确限制到首页 GET/HEAD 的接入逻辑，其余路径交回原应用。
- 可重复构建、内容 hash、CSP、路由边界测试与上线检查脚本。
- staging、生产验收和回滚步骤。

你需要在当前 Cloudflare 账号里定位 `anc.ha7ch.com` 的真实 Worker 和源码，把模块接在原首页路由，然后按原流程部署。这个域名仍在承载网页展示、入职和 API，所以本次不更换 DNS、不覆盖原 Worker、不修改现有鉴权或数据。

本仓库中的代码和部署包已经准备；实际 Worker 接入及生产发布尚未执行。完成后请按 SOP 最后一节回传版本与验收结果。
