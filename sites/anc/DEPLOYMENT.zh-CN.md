# ANC 官网部署 SOP

目标：把已确认的 ANC 官网接到 `https://anc.ha7ch.com/`。这次只更新首页，保留现有 `/p/*` 网页展示、`/<company>/onboard.md` 入职入口、`/api/*`、鉴权及 sitemap 行为。

交付物位于本仓库 `sites/anc/`。网站主线是 **ANC = AI Native Company**，从老板、中层、员工三种视角解释理念；已移除“Help me understand ANC”提示词入口。中英文、任务示例、FAQ、手机布局均已准备。

## 1. 先确认生产服务归属

在现有 Cloudflare 账号的 Workers & Pages 中找到绑定 `anc.ha7ch.com` 的服务，记录以下信息到本地发布记录，**不要把配置值或令牌写进本仓库**：

| 要确认的项目 | 要填写的真实值 |
| --- | --- |
| 当前 Worker 的源码仓库及入口文件 | 由现有服务配置确定 |
| Worker 名称、账号、生产配置文件与环境 | 由现有部署流程确定 |
| 当前线上版本 ID、对应源码提交 | 用于精确回滚 |
| 现有部署命令或 CI 工作流 | 沿用现有流程及固定工具版本 |
| 一个实际存在的 `/p/<slug>` 页面 | 选用允许检查的已有页面 |
| 一个实际使用的 `/<company>/onboard.md` | 选用允许检查的已有入口 |
| 现有 API 的健康检查、匿名拒绝、授权读取检查 | 使用项目已有检查 |

**原 Worker 的接入源码现已保存在 `worker/worker.mjs`，账号配置仍不入库。** `ha7ch-home` 是本网站源码的交付位置，根目录的 Vercel 部署命令不能把这个目录接到 ANC 域名。不要从本目录新建同名 Worker、修改 DNS 或覆盖原应用；后续发布使用 `worker/README.md` 的维护流程，仍需核对真实 Worker 的当前版本和配置。

生产入口若由 Dashboard 维护，先导出并保存当前完整代码和配置记录；如果无法确认当前完整源码或回滚版本，先补齐这一步。

## 2. 取得这份代码并检查

从交接分支 `anc/product-website-lawted-handoff` 获取代码，或在 PR 合并后使用 `master`。发布前记录最终采用的完整 Git commit；不要把未审阅的其他修改一并部署。

没有本地克隆时，可以在独立目录取得交接分支：

```bash
git clone --branch anc/product-website-lawted-handoff --single-branch https://github.com/HA7CH/ha7ch-home.git anc-website-handoff
cd anc-website-handoff
```

```bash
# 已有 ha7ch-home 克隆时，在仓库根目录执行。
git status --short
git fetch origin
# 检出交接 PR 对应的分支，或已合并并确认的 master。
# 若当前工作区有其他工作，使用独立克隆或 worktree。
git rev-parse HEAD
cd sites/anc
node --version
npm run build
npm run check
npm test
```

要求 Node.js 22 或更新版本。这个子项目没有依赖，不需要运行 `npm install`。所有命令均在 `sites/anc` 内运行，不能误用官网根目录的构建/部署脚本。

应得到：

- `release/anc-homepage.mjs`：要接入原 Worker 的完整单文件模块。
- `release/anc-standalone.html`：内联全部静态资源的 HTML。
- `release/manifest.json`：源文件与产物的 SHA-256。

`npm run check` 会检查生成物是否与源文件一致。修改页面后重新执行 build/check/test；不要手工改生成物。

## 3. 本地查看最终响应

```bash
npm run dev
```

打开终端输出的本地地址。这个预览加载的是生成模块的实际响应，包含上线所需 CSP。检查以下内容：

- 首屏是 ANC / AI Native Company，没有提示词复制入口。
- 老板、中层、员工三个入口能跳到对应段落。
- 中英文切换后，角色叙事、任务示例和 FAQ 一起切换。
- 任务四个步骤、键盘导航、FAQ 搜索/分类/展开可用。
- 375–390px 手机宽度下没有横向溢出。
- 浏览器控制台没有本网站引起的脚本错误或 CSP 拦截。

停止本地预览后，准备接入真实 Worker。预览脚本不是生产入口。

## 4. 只在原来的首页路由接入

把 `release/anc-homepage.mjs` 复制到原 Worker 源码目录，例如原入口文件旁边。文件名可以保留，import 相对路径以真实目录为准。

```js
import { createAncHomepageHandler } from './anc-homepage.mjs';

// 生产默认只匹配 anc.ha7ch.com。
const ancHomepage = createAncHomepageHandler();
```

在**原应用处理首页的位置**加入：

```js
const homepage = ancHomepage(request);
if (homepage) return homepage;

// 继续原来的路由处理。
```

这两段是局部接入示意，不是完整 Worker。若使用 Hono 或其他路由框架，在原来的根路由里调用；若使用模块格式 Worker，在原 `fetch` 内相应位置调用。保留原有身份校验、中间件、响应包装、事件处理器及其他导出，不要用一个新的 `export default` 把原服务替换掉。

模块的边界：

| 请求 | 模块行为 |
| --- | --- |
| `GET https://anc.ha7ch.com/` | 返回完整官网 |
| `GET /?lang=zh` 或 `/?lang=en` | 返回同一官网，由前端选择语言 |
| `HEAD /` | 返回相同响应头，不返回 HTML body |
| `/p/*`、入职文件、`/api/*`、`/sitemap.xml` 等其他路径 | 返回 `null`，交回原应用 |
| `POST /`、`OPTIONS /` 等其他方法 | 返回 `null`，交回原应用 |
| 其他主机名 | 默认返回 `null` |

在正式 staging 环境检查时，显式加入**真实的 staging 主机名**，例如：

```js
const ancHomepage = createAncHomepageHandler({
  allowedHosts: ['anc.ha7ch.com', 'YOUR_ACTUAL_STAGING_HOST']
});
```

把占位符换成经过确认的 host，不带协议或路径；不要用通配符。只有真正要作为官网入口的域名才加入名单。默认生产配置不需要修改。

整个页面已经打包在模块中，无需添加 `/style.css`、`/app.js`、`/assets/*` 路由，也无需 KV/R2 写入。

### CSP 与缓存

模块为自己的响应生成了匹配最终字节的脚本/样式 hash CSP，允许 data URL 图标；不依赖 `unsafe-inline`。保留这一约束，不要全局关闭原应用的 CSP。

若原中间件、Cloudflare Transform Rules、其他代理层会追加 CSP，或自动修改 HTML，必须在 staging 检查最终响应：多个 CSP 会同时生效，脚本/样式字节被改动会导致 hash 不再匹配。只在首页的响应路径协调这些规则，不能放宽 API 或其他页面的安全策略。

`no-transform` 阻止 Cloudflare 自动注入统计脚本，保持最终 HTML 与 CSP hash 一致。参见 [Cloudflare 官方说明](https://developers.cloudflare.com/web-analytics/faq/)。

初次上线使用 `Cache-Control: no-store, no-transform`，便于立即回滚。检查已有 Cache Rules/HTML 转换不会覆盖这一意图。响应中的 `X-ANC-Site-Version` 是 HTML 的 SHA-256，便于核对版本，不含任何凭据。

## 5. 集成检查与上线

在原 Worker 的独立工作分支里：

1. 保存上线前根路径及已有页面、入职入口、API 鉴权和 sitemap 的状态码、内容类型及稳定内容标记。使用经过确认的真实路径，不要拿占位路径的 404 当作通过。
2. 运行原 Worker 仓库要求的测试和检查。
3. 用原仓库已经安装并固定版本的 Wrangler 执行 dry run（或原 CI 对应的构建检查），使用真实生产配置及环境。

```bash
# 以下命令中的配置文件必须替换为原项目的真实值。
# 若项目使用命名环境，所有命令都带同一个实际 --env。
wrangler deployments list --config PATH_TO_EXISTING_CONFIG
wrangler deploy --dry-run --outdir LOCAL_TEMP_OUTPUT --config PATH_TO_EXISTING_CONFIG
```

如果原项目通过 npm/pnpm 脚本调用 Wrangler，沿用其调用方式；不要临时安装未固定版本的工具。dry run 不是已部署。

4. 先发布到现有 staging/预览环境；确认 host allowlist 包含它。运行：

```bash
# 从 sites/anc 执行；URL 换成真实 staging origin。
node operations/verify-live.mjs https://YOUR_ACTUAL_STAGING_HOST
```

5. 在浏览器重复第 3 节的交互检查，并比对以下保留路径的上线前基线：

| 检查 | 通过条件 |
| --- | --- |
| 一个已有 `/p/<slug>` | 状态、页面关键内容、访问要求保持一致 |
| 一个已有入职 Markdown 入口 | 仍返回原内容和正确类型，不返回官网 HTML |
| API 匿名请求 | 仍按原规则拒绝或响应，没有权限扩大 |
| API 授权读取与健康检查 | 使用原项目已有检查并通过 |
| sitemap、已有其他入口 | 仍按原服务逻辑响应 |
| 非首页路由 | 不带新增的 `X-ANC-Site-Version` 响应头 |

不要为检查而在生产系统随意发送可能写数据的 POST/PUT/DELETE。路由单元测试覆盖非 GET 方法的 fallthrough；真实写入链路沿用原项目已授权的测试流程。

6. 记录当前线上版本 ID，再通过**原生产部署流程**发布。仅修改首页模块和接入点，不修改 DNS、绑定、账号权限、Secrets、KV/D1 数据或其他资源。
7. 生产发布完成后，从本网站目录执行：

```bash
node operations/verify-live.mjs https://anc.ha7ch.com
```

再运行相同的保留路径与鉴权检查，并从普通浏览器实际打开首页。`verify-live` 只验证官网响应，不能代替原业务路由的验收。

## 6. 出问题时回滚

以下任何一项出现即暂停推广并回滚：已有页面/入职/API 受影响；鉴权行为变化；官网脚本被 CSP 拦截；线上内容 hash 不匹配；页面交互不可用。

在原项目、相同配置与环境下，回滚到**第 5 节第 6 步、紧邻生产发布前记录的明确版本 ID**。第 1 节的初始记录可能已经过时，不要因此撤销准备期间其他人的发布：

```bash
wrangler rollback RECORDED_PREVIOUS_VERSION_ID --config PATH_TO_EXISTING_CONFIG
```

也可以在 Cloudflare Dashboard 的该 Worker → Deployments 中选择同一已记录版本执行回滚。不要省略版本 ID 后猜测“上一个版本”。回滚后重新检查原首页、已有页面、入职入口和 API。回滚重新部署指定的 Worker 版本，不恢复外部资源数据；本次发布因此不包含资源或数据迁移。

源码侧撤销本次首页接入提交，避免后续部署重新带回。若存在其他人后续修改，不要强制覆盖其代码。

## 7. 部署完成后回传

回传一条简短记录即可，不要发送 token、Cookie 或私有配置：

```text
ANC 官网已部署：
URL：https://anc.ha7ch.com/
网站源码 commit：
原 Worker 接入 commit：
Worker 部署版本 ID：
X-ANC-Site-Version：
桌面 / 手机 / 中英文 / 角色入口 / 任务示例 / FAQ：通过
已有页面 / 入职 / API 鉴权 / sitemap：通过
可回滚版本 ID（生产发布前刚刚记录的版本）：
```

只有生产 URL 返回正确内容、交互检查和原服务检查都通过，才算部署完成。源码已提交、dry run 成功、预览成功，都不能替代生产验收。

## 官方命令参考

- [Wrangler Workers 命令](https://developers.cloudflare.com/workers/wrangler/commands/workers/)
- [Worker 版本与部署](https://developers.cloudflare.com/workers/versions-and-deployments/)
- [Worker 回滚](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

这些文档只用于核对命令语义；实际账号、Worker、配置和环境以现有生产项目为准。
