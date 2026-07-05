import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Glimmer Privacy Policy — HA7CH",
  description:
    "Glimmer does not collect, store, or share any personal information. Your photos never leave your device.",
  openGraph: {
    title: "Glimmer Privacy Policy",
    description:
      "Glimmer does not collect, store, or share any personal information. Your photos never leave your device.",
    url: "https://ha7ch.com/glimmer/privacy",
    siteName: "HA7CH",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Glimmer Privacy Policy",
    description:
      "Glimmer does not collect, store, or share any personal information. Your photos never leave your device.",
  },
};

const lastUpdated = "May 21, 2026";

const en: Array<{ heading?: string; body: string }> = [
  {
    body: "Glimmer does not collect, store, or share any personal information. Your photos and memories never leave your device.",
  },
  {
    heading: "Photo library access",
    body: "Glimmer reads your photo library locally on your iPhone using Apple's PhotoKit. We only look at each photo's EXIF metadata — its timestamp and (if present) GPS coordinate — to cluster photos into places and visits. The image data itself is never copied off your device, never uploaded, and never shared.",
  },
  {
    heading: "People in photos",
    body: "If you grant access, Glimmer can read Apple's on-device person clusters from PhotoKit to show who you were with at each place. The face recognition itself is performed by iOS, locally on your device. Glimmer does not run its own face recognition and does not send any person data anywhere.",
  },
  {
    heading: "What stays on your device",
    body: "Every place, visit, journey, memory line you write, and preference is stored locally on your iPhone using Apple's standard storage APIs. Nothing is uploaded to our servers — we don't run any.",
  },
  {
    heading: "What we send to third parties",
    body: "To turn a GPS coordinate into a readable place name (e.g. \"Yoyogi Park, Tokyo\"), Glimmer uses Apple's own geocoding service via the system MapKit / CLGeocoder APIs. Only the coordinate is sent, by iOS, to Apple. We do not use Google, Mapbox, or any other third-party map service. No request to any server identifies you.",
  },
  {
    heading: "Tracking",
    body: "Glimmer does not use any analytics, crash reporting, or advertising SDKs. There is no Glimmer account and no server-side log of how you use the app. We do not track you across apps or websites.",
  },
  {
    heading: "Children",
    body: "Glimmer is suitable for general audiences and does not knowingly collect data from anyone, including children under 13.",
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
    body: "微光不收集、不存储、不分享任何个人信息。你的照片和回忆永远不会离开你的设备。",
  },
  {
    heading: "照片库访问",
    body: "微光通过 Apple 的 PhotoKit 在你的 iPhone 本地读取相册。我们只读取每张照片的 EXIF 元数据 —— 拍摄时间和(若存在)GPS 坐标 —— 用于把照片聚类成地点和到访记录。照片本体不会被复制出设备,不会上传,也不会分享。",
  },
  {
    heading: "照片中的人",
    body: "如果你授权,微光会读取 iOS 在 PhotoKit 中本地维护的人物分组,用来在每个地点展示当时与你同行的人。人脸识别本身完全由 iOS 在你设备本地完成,微光不进行任何独立的人脸识别,也不会把任何人物数据传到任何地方。",
  },
  {
    heading: "数据完全保留在你的设备上",
    body: "你所有的地点、到访、旅程、为某一天写下的回忆,以及偏好设置,都通过 Apple 标准存储 API 保存在你的 iPhone 本地。我们不会上传到任何服务器 —— 我们也不运行任何服务器。",
  },
  {
    heading: "发送给第三方的内容",
    body: "为了把一个 GPS 坐标解析成可读的地名(例如\"东京 代代木公园\"),微光会通过 iOS 系统的 MapKit / CLGeocoder 接口调用 Apple 自己的地理服务。只有坐标被 iOS 发送给 Apple,我们不使用 Google、Mapbox 或任何其他第三方地图服务,任何请求都不包含能识别你身份的信息。",
  },
  {
    heading: "追踪",
    body: "微光不使用任何 analytics、crash 报告或广告 SDK。微光没有账号,服务器端也没有任何关于你如何使用 app 的日志。我们不会跨 app 或网站追踪你。",
  },
  {
    heading: "儿童",
    body: "微光面向所有年龄段用户,不会主动收集任何人(包括 13 岁以下儿童)的数据。",
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

export default function GlimmerPrivacy() {
  return (
    <main className="writing-page">
      <Link href="/" className="writing-back">
        HA7CH
      </Link>

      <article className="writing-article">
        <header className="writing-header">
          <h1 className="writing-title">Glimmer Privacy Policy</h1>
          <div className="writing-meta">
            <time dateTime="2026-05-21">Last updated {lastUpdated}</time>
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
            <h2>微光 隐私政策</h2>
            <p className="legal-meta">最后更新 2026-05-21</p>
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
