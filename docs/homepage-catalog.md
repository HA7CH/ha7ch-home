# 官网活动与项目数据

运行 `npm run sync:catalog`，从 mee7 `list_events` 和 GitHub 公开仓库读取资料，生成 `src/content/catalog.generated.json`。本地预览通过热更新读取新数据；生产站需重新构建发布。

这是一份可刷新的真实数据快照，当前没有后台定时同步。公开页面不携带主办方 token，也不在每次访问时调用主办接口。

## 来源与范围

- mee7：使用 `MEE7_TOKEN` 或已经登录的 `~/.mee7/config.json`，只调用 `list_events`。只取公开活动名称、状态、时间、落地页与公开描述，不读取报名者、对话或联系方式。
- 活动公开性：排除 draft、测试、现场进组和 AdventureX 入口，并核验公开落地页的 Event 结构化数据。
- GitHub：使用无需凭据的 HA7CH 公开仓库接口，只同步脚本中选定的十个仓库。新增展示项目需加入公开项目清单与 `catalog.ts` 的介绍。
- 上游读取失败会令命令失败，保留先前快照；先查看错误，再重试同步。
- `src/content/catalog.ts` 维护官网短介绍，与上游时间、报名状态分开。新公开活动使用 mee7 原描述，发布前应编辑为适合首页的简洁介绍。
- FDE PRO S26（`fde-pro-s26`）官网描述必须突出“在国家人工智能应用中试基地举办”，不展示与 Sagenic Tech 联合举办的措辞（2026-09-05 用户确认）。上游快照保留原始资料，刷新快照不得覆盖此编辑文案。
- 少量旧活动的 `start_at` 为 0，使用已有官网日期或 mee7 时间文字补足排序；后续可在 mee7 补齐正式时间字段。
- `src/content/projects-legacy.ts` 保留既有产品网站入口。它们并非全都具有公开 GitHub 仓库，不以旧提交时间判断停运。

## 页面路径

- 北京场 `beijing-fde-pro` 已于 2026-09-05 结束（2026-09-07 用户确认）。`catalog.ts` 的 `eventArchives` 将其固定放在 Past，标注“已结束 · 查看 PPT”，并链接 `/beijing-fde-pro`。原演示页面及静态资源保持不变；后续刷新上游快照不应恢复报名入口。此覆盖仅影响官网，不修改 mee7 状态。

- `/academy` → School、FDE Camp 与老板 AI 战略营。
- `/academy/executive-ai-camp` → 老板课两天课程、双席位、六项成果、后续支持与 `HA7CH/anc-executive-camp` Skill。
- `/hcn` → mee7 `hcn-creator-pilot-01`。
- `/anc-fund` → mee7 `anc-fund-s26`。
- `/hdc` → ANC Deployment 与 ANC-Diagnosis。
- `/hdc/diagnosis` → 五天现场诊断、两档报价、GO/HOLD/NO-GO 与 `HA7CH/anc-diagnosis` Skill。
- `/wechat` → 用户提供的公众号二维码原图，可保存。

报名提交、审核与通知继续在 mee7 中完成；官网仅提供详情和跳转。

## 两个新产品 Skill

2026-09-05 按用户提供的两组四张海报整理，内容以这次明确提供的资料为准。

- `HA7CH/anc-diagnosis`：根目录 `SKILL.md`、服务与现场流程参考、安装 README、Codex UI metadata。
- `HA7CH/anc-executive-camp`：根目录 `SKILL.md`、课程定位与两天课程参考、安装 README、Codex UI metadata。
- 两仓库已经创建并公开推送，GitHub API 验证为 public 且 `SKILL.md` 可读；Skills CLI 远端发现测试通过。
- `src/content/services.ts` 是官网两个产品的统一文案入口。报价保留 Diagnosis 的“起”，老板课按每家企业双席位；不捏造排期和席位状态，不把团队学校背景写成机构背书。
- 这次只把两个已核实的新仓库追加到项目快照，保留原活动快照及其同步时间。后续全量刷新会通过 allowlist 自动保留它们。
