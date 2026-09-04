# Participants 准入与维护说明

更新：2026-09-05。按用户要求，名单体现实质代码贡献，不直接展示所有开过 PR 的账号。

## 准入规则（本次暂定阈值）

- 至少 5 次已进入 HA7CH 产品仓库默认分支的实质代码提交，逐项人工复核。
- 官网 `ha7ch-home`、教学入口 `ha7ch-school`、组织介绍 `.github` 不计入门槛。
- 不计纯文档、名单、文案、格式、数据文件、锁文件、版本号，以及纯 merge 提交；不能靠拆分微小提交刷数量。
- 关注功能实现、业务逻辑、可靠性修复、配套测试与有实际逻辑的工具脚本。行数和 GitHub contributions 总数只用于筛选候选，不能自动认定达标。
- 5 次是这次为落实“达到一定贡献”采用的编辑门槛，不是用户指定的永久数字。后续调门槛必须保持人工审查与一致性。
- 不使用私有仓库或私人组织成员信息补齐公开证据。未入选表示本次公开证据未达到门槛，不表示没有其他贡献。

## 本次核对

初筛遍历 18 个公开仓库的 contributors API，得到 20 个唯一 User 账号，排除 vercel[bot]。
排除上述仓库后，只有 LAWTED、MWDZ、dxh2723192626 的返回总量足以达到初筛门槛。
继续查看默认分支作者提交与每个提交的代码 diff，三人均有至少五项实质代码提交。

### dxh2723192626 · job-pro

简历多格式输入、学历匹配、PDF 双解析器与回退、多个招聘适配器的关键词召回修复。
- https://github.com/HA7CH/job-pro/commit/f322fab60851d11b5e4654a53cfc1a63b81b784c
- https://github.com/HA7CH/job-pro/commit/c495922985454184eb700d2f89ec966549169961
- https://github.com/HA7CH/job-pro/commit/8d3a9f640daa5ccec82ddaaa73c4fb0282f19f41
- https://github.com/HA7CH/job-pro/commit/2469a45be55ee0cc139d407153ab2998d29b0504
- https://github.com/HA7CH/job-pro/commit/0d394b5b488149648fc12a9d32f882946925a5b3

### MWDZ · gaokao-pro

动态 API 迁移、招生计划拉取逻辑、并行录取查询、缓存与批量查询、学校解析与错误学校防护。
- https://github.com/HA7CH/gaokao-pro/commit/6be9143686c439128b648ccc7e72998f2a65f66f
- https://github.com/HA7CH/gaokao-pro/commit/87648b14419d7de2c46749f289a755176a085ae3
- https://github.com/HA7CH/gaokao-pro/commit/bf1d9feb043ba955dd376224f84dbd3b486eb93e
- https://github.com/HA7CH/gaokao-pro/commit/1bbe50755f8e4a338b9a3b5b1653ede444bb6ced
- https://github.com/HA7CH/gaokao-pro/commit/6efa1699d6e1990cb4f4c726e44ef14621d893db

### LAWTED · job-pro

招聘适配器修复、商汤数据源迁移、移除自动投递转为只读架构、Moka 分页与职位详情、详情 URL 逻辑修复。
- https://github.com/HA7CH/job-pro/commit/b8a3c4e0a5b1232ae94f268a025cbe8e4cd826e1
- https://github.com/HA7CH/job-pro/commit/98673d08fc8a77fda54fd9d642d7b413ffbcdd63
- https://github.com/HA7CH/job-pro/commit/5431f8ac435f3b4ce24808dd78412f95579d6694
- https://github.com/HA7CH/job-pro/commit/8db55e63a9f0725a6ee35394b016176648dfa819
- https://github.com/HA7CH/job-pro/commit/bd7d0ec76807ae5738400cd1351196958711b02d

## 展示规则

- 保留原来的单排叠放头像、spring 展开和倾斜浮签。不得自动改成网格或拆成多排。
- 人的浮签只显示名字和 GitHub 公开 location；没有所在地就不显示第二行，不展示项目数量、贡献排名或“维护者”头衔。
- 当前公开 location：LAWTED 为 “Hangzhou,  China”（仅规范空格），MWDZ 为 “Mountain View, CA”，dxh2723192626 为 null。
- Claude、ChatGPT、Gemini 仅保留为原有 AI 协作头像，不参与真人准入或人数计算，浮签只显示名称。
- 原来仅有官网 / School 贡献或未核实代码贡献的头像不再凭旧名单自动入选。
- 本轮未新增使用非公开地址，也未推断居住地。location 仅代表账号自行公开填写的地区。

## 更新入口

`src/content/participants.generated.json` 保留公开初筛快照，**不直接决定展示**。
`src/app/Participants.tsx` 中 `admitted` 是人工审核后的名单。新增前先补证据到本文，再补已公开的 location；没有就留空。
GitHub contributor 记录可能缓存，不等于当前维护权限或任职信息。准入依据必须可追到默认分支中的实际代码，不以打开 PR 本身为依据。
