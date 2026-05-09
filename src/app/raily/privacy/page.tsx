import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raily Privacy Policy — HA7CH",
  description:
    "Raily does not collect, store, or share any personal information.",
  openGraph: {
    title: "Raily Privacy Policy",
    description:
      "Raily does not collect, store, or share any personal information.",
    url: "https://ha7ch.com/raily/privacy",
    siteName: "HA7CH",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Raily Privacy Policy",
    description:
      "Raily does not collect, store, or share any personal information.",
  },
};

const lastUpdated = "May 10, 2026";

const en: Array<{ heading?: string; body: string }> = [
  {
    body: "Raily does not collect, store, or share any personal information.",
  },
  {
    heading: "What stays on your device",
    body: "All your trips, preferences, and uploaded avatar are stored locally on your iPhone using Apple's standard storage APIs. Nothing is uploaded to our servers — we don't run any.",
  },
  {
    heading: "What we send to third parties",
    body: "When you look up a train, the app sends only the train number and route query to public services to fetch publicly-available train data: api.rail.re (train model), m.suanya.com (gate / platform info), and *.12306.cn (China Railway official schedule data). These requests contain no information that identifies you.",
  },
  {
    heading: "Tracking",
    body: "Raily does not use any analytics, crash reporting, or advertising SDKs. We do not track you across apps or websites.",
  },
  {
    heading: "Children",
    body: "Raily is suitable for general audiences and does not knowingly collect data from anyone, including children under 13.",
  },
  {
    heading: "Changes",
    body: "If this policy changes, we will update the date at the top of this page. Material changes will also be noted in the app's release notes.",
  },
  {
    heading: "Contact",
    body: "Questions? Email lawtedwu@gmail.com.",
  },
];

const zh: Array<{ heading?: string; body: string }> = [
  {
    body: "Raily 不收集、不存储、不分享任何个人信息。",
  },
  {
    heading: "数据完全保留在你的设备上",
    body: "你的所有行程、偏好设置和上传的头像,都通过 Apple 标准存储 API 保存在你的 iPhone 本地。我们不会上传到任何服务器 —— 我们也不运行任何服务器。",
  },
  {
    heading: "发送给第三方的内容",
    body: "当你查询列车时,app 只会向公开服务发送列车号和路线查询参数,以获取公开的列车数据:api.rail.re(列车型号)、m.suanya.com(检票口/站台)以及 *.12306.cn(中国铁路官方时刻表)。这些请求不包含任何能识别你身份的信息。",
  },
  {
    heading: "追踪",
    body: "Raily 不使用任何 analytics、crash 报告或广告 SDK,不会跨 app 或网站追踪你。",
  },
  {
    heading: "儿童",
    body: "Raily 面向所有年龄段用户,不会主动收集任何人(包括 13 岁以下儿童)的数据。",
  },
  {
    heading: "变更",
    body: "如本政策有变更,我们会更新本页顶部的日期。重大变更也会在 app 更新说明中标注。",
  },
  {
    heading: "联系",
    body: "问题请发送至 lawtedwu@gmail.com。",
  },
];

export default function RailyPrivacy() {
  return (
    <main className="writing-page">
      <a href="/" className="writing-back">
        HA7CH
      </a>
      <article className="writing-article">
        <header className="writing-header">
          <h1 className="writing-title">Raily Privacy Policy</h1>
          <div className="writing-meta">
            <time dateTime="2026-05-10">Last updated {lastUpdated}</time>
          </div>
        </header>
        <div className="writing-body legal-body">
          {en.map((section, i) => (
            <section key={`en-${i}`}>
              {section.heading ? <h2>{section.heading}</h2> : null}
              <p>{section.body}</p>
            </section>
          ))}

          <hr className="legal-rule" aria-hidden="true" />

          <section className="legal-zh-intro">
            <h2>Raily 隐私政策</h2>
            <p className="legal-meta">最后更新 2026-05-10</p>
          </section>
          {zh.map((section, i) => (
            <section key={`zh-${i}`}>
              {section.heading ? <h2>{section.heading}</h2> : null}
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
