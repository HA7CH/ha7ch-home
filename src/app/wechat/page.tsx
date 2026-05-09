import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WeChat group · HA7CH",
  description: "Join the HA7CH WeChat user group."
};

export default function WeChat() {
  return (
    <main className="homepage">
      <article className="article">
        <header>
          <h1 className="wechat-title">WeChat group</h1>
          <p className="wechat-back">
            <Link className="basic-link" href="/">← Back to ha7ch.com</Link>
          </p>
        </header>

        <p>
          Scan the QR code with WeChat to join the HA7CH user group. If the code
          has expired, ping us on{" "}
          <a className="basic-link" href="mailto:lawtedwu@gmail.com">email</a>{" "}
          and we&apos;ll send a fresh one.
        </p>

        <div className="wechat-qr">
          <Image
            src="/wx-group-0508.jpg"
            alt="HA7CH WeChat group QR code"
            width={1080}
            height={1596}
            priority
          />
        </div>
      </article>
    </main>
  );
}
