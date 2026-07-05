import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Glimmer Support — HA7CH",
  description:
    "Help and contact information for Glimmer, a quiet map of every place you've ever taken a photo.",
  openGraph: {
    title: "Glimmer Support",
    description:
      "Help and contact information for Glimmer, a quiet map of every place you've ever taken a photo.",
    url: "https://ha7ch.com/glimmer/support",
    siteName: "HA7CH",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Glimmer Support",
    description:
      "Help and contact information for Glimmer, a quiet map of every place you've ever taken a photo.",
  },
};

const faqEn: Array<{ q: string; a: string }> = [
  {
    q: "How do I join the beta?",
    a: "Glimmer is in TestFlight. Open https://testflight.apple.com/join/HdcnmhtW on your iPhone, install TestFlight if you haven't, then accept the invite.",
  },
  {
    q: "My map is empty or missing places.",
    a: "Glimmer only sees photos that have a GPS coordinate in their EXIF metadata. Screenshots, AirDropped images, and photos taken with Location Services off won't appear on the map. Make sure Settings → Privacy & Security → Location Services → Camera is set to \"While Using\" so new photos get geotagged.",
  },
  {
    q: "A pin is in the wrong place on the map.",
    a: "Glimmer uses the GPS coordinate iOS wrote into the photo's EXIF — we don't re-locate photos ourselves. Tap the place to open it and edit the location manually. If a specific photo is consistently wrong, it usually means the original EXIF coordinate is off.",
  },
  {
    q: "Does Glimmer upload my photos?",
    a: "No. Glimmer reads EXIF metadata locally on your device. The images themselves are never copied off your iPhone, never uploaded, and never shared. See the privacy policy at /glimmer/privacy for the full breakdown.",
  },
  {
    q: "How does Glimmer know who's in my photos?",
    a: "It doesn't run face recognition. iOS already maintains a local \"People\" album in Photos; Glimmer simply reads that grouping, with your permission, to show co-visitors at each place. Apple's clustering stays on your device — and so does ours.",
  },
  {
    q: "Time Machine playback is laggy or skipping.",
    a: "Playback is GPU-heavy on older devices when a year contains many places. Try lowering the playback speed, or scrubbing through a shorter date range. If it still feels rough on a recent device, email us with the device model and how many places are on your map.",
  },
  {
    q: "How do I switch language?",
    a: "Profile → Settings → Language. You can choose English, 中文, or Follow System. After switching, restart the app so all screens pick up the new language.",
  },
  {
    q: "How do I delete my data?",
    a: "Everything is stored locally on your device. To remove all Glimmer data, simply delete the app — there is nothing on our servers to remove.",
  },
];

const faqZh: Array<{ q: string; a: string }> = [
  {
    q: "怎么加入测试?",
    a: "微光在 TestFlight 上测试中。用 iPhone 打开 https://testflight.apple.com/join/HdcnmhtW,先安装 TestFlight,再接受邀请即可。",
  },
  {
    q: "地图是空的,或者少了一些地方。",
    a: "微光只能看到 EXIF 元数据里带 GPS 坐标的照片。截图、AirDrop 传过来的图、以及关闭定位时拍的照片不会出现在地图上。请确认 设置 → 隐私与安全 → 定位服务 → 相机 设为\"使用 App 时\",这样新拍的照片才会带定位。",
  },
  {
    q: "地图上的位置标错了。",
    a: "微光读取的是 iOS 写入照片 EXIF 的 GPS 坐标,我们不会自己重新定位。点开那个地点,可以手动修改位置。如果某张照片一直标错,通常是原始 EXIF 坐标本身就不准。",
  },
  {
    q: "微光会上传我的照片吗?",
    a: "不会。微光只在设备本地读取 EXIF 元数据,照片本体不会被复制出 iPhone,也不会上传或分享。完整说明见 /glimmer/privacy 隐私政策。",
  },
  {
    q: "微光怎么知道照片里有哪些人?",
    a: "它并不进行人脸识别。iOS 自己在相册里维护了一份本地的\"人物\"分组,微光在你授权后只是读取这份分组,用来展示每个地点的同行者。Apple 的聚类全部在你设备本地完成,我们也是。",
  },
  {
    q: "时光机播放卡顿、有跳帧。",
    a: "在旧设备上,如果某一年里地点很多,播放会比较吃 GPU。可以试试降低播放速度,或者只播放一段较短的时间范围。如果在较新设备上仍然卡,请把设备型号和地图上的地点总数发邮件给我们。",
  },
  {
    q: "怎么切换语言?",
    a: "Profile → Settings → Language。可以选 English、中文,或跟随系统。切换之后请重启 app,让所有界面都更新为新语言。",
  },
  {
    q: "如何删除我的数据?",
    a: "所有数据都存在你设备本地。要清除微光的全部数据,直接卸载 app 即可 —— 我们的服务器上没有任何东西需要删除。",
  },
];

export default function GlimmerSupport() {
  return (
    <main className="writing-page">
      <Link href="/" className="writing-back">
        HA7CH
      </Link>

      <article className="writing-article">
        <header className="writing-header">
          <h1 className="writing-title">Glimmer Support</h1>
          <div className="writing-meta">
            <time dateTime="2026-05-21">Last updated May 21, 2026</time>
          </div>
        </header>
        <div className="writing-body legal-body">
          <section>
            <p>
              Need help with Glimmer? Email{" "}
              <a className="basic-link" href="mailto:lawtedwu@gmail.com">
                lawtedwu@gmail.com
              </a>{" "}
              — typical response within 24 hours.
            </p>
          </section>

          <h2>Common questions</h2>
          {faqEn.map((item, i) => (
            <section key={`en-${i}`}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </section>
          ))}

          <hr className="legal-rule" aria-hidden="true" />

          <section className="legal-zh-intro">
            <h2>微光 帮助</h2>
            <p className="legal-meta">最后更新 2026-05-21</p>
          </section>
          <section>
            <p>
              需要帮助?发邮件至{" "}
              <a className="basic-link" href="mailto:lawtedwu@gmail.com">
                lawtedwu@gmail.com
              </a>
              ,通常 24 小时内回复。
            </p>
          </section>

          <h2>常见问题</h2>
          {faqZh.map((item, i) => (
            <section key={`zh-${i}`}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
