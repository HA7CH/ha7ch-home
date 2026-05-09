import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raily Support — HA7CH",
  description: "Help and contact information for Raily, the rail companion app.",
  openGraph: {
    title: "Raily Support",
    description:
      "Help and contact information for Raily, the rail companion app.",
    url: "https://ha7ch.com/raily/support",
    siteName: "HA7CH",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Raily Support",
    description:
      "Help and contact information for Raily, the rail companion app.",
  },
};

const faqEn: Array<{ q: string; a: string }> = [
  {
    q: "Train data looks wrong or outdated.",
    a: "Raily reads from public 12306 sources. If the official 12306 site shows different info, please email us with the train number and date and we'll investigate.",
  },
  {
    q: "Live Activity isn't appearing on the lock screen.",
    a: "Make sure Live Activities are enabled in iOS Settings → Raily → Live Activities, and that Focus modes aren't suppressing them.",
  },
  {
    q: "How do I switch language?",
    a: "Profile → Settings → Language. Raily has its own EN / 中文 toggle that's independent from your iPhone's system language.",
  },
  {
    q: "How do I delete my data?",
    a: "Everything is stored locally on your device. To remove all Raily data, simply delete the app — there is nothing on our servers to remove.",
  },
];

const faqZh: Array<{ q: string; a: string }> = [
  {
    q: "列车数据显示错误或过时。",
    a: "Raily 读取公开的 12306 数据源。如果官方 12306 显示的信息不同,请把列车号和日期发邮件给我们,我们会跟进。",
  },
  {
    q: "锁屏上看不到 Live Activity。",
    a: "请确认 iOS 设置 → Raily → Live Activities 已开启,并且 Focus(专注)模式没有屏蔽它。",
  },
  {
    q: "怎么切换语言?",
    a: "Profile → Settings → Language。Raily 有自己的中英切换,独立于 iPhone 系统语言。",
  },
  {
    q: "如何删除我的数据?",
    a: "所有数据都存在你设备本地。要清除 Raily 的全部数据,直接卸载 app 即可 —— 我们的服务器上没有任何东西需要删除。",
  },
];

export default function RailySupport() {
  return (
    <main className="writing-page">
      <a href="/" className="writing-back">
        HA7CH
      </a>
      <article className="writing-article">
        <header className="writing-header">
          <h1 className="writing-title">Raily Support</h1>
          <div className="writing-meta">
            <time dateTime="2026-05-10">Last updated May 10, 2026</time>
          </div>
        </header>
        <div className="writing-body legal-body">
          <section>
            <p>
              Need help with Raily? Email{" "}
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
            <h2>Raily 帮助</h2>
            <p className="legal-meta">最后更新 2026-05-10</p>
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
