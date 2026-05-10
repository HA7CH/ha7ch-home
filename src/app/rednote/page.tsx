import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RedNote group · HA7CH",
  description: "Join the HA7CH RedNote (Xiaohongshu) user group."
};

export default function RedNote() {
  return (
    <main className="homepage">
      <article className="article">
        <header>
          <h1 className="wechat-title">RedNote group</h1>
          <p className="wechat-back">
            <Link className="basic-link" href="/">← Back to ha7ch.com</Link>
          </p>
        </header>

        <p>
          Scan the QR code with RedNote (小红书) to join the HA7CH user group. If
          the code has expired, ping us on{" "}
          <a className="basic-link" href="mailto:lawtedwu@gmail.com">email</a>{" "}
          and we&apos;ll send a fresh one.
        </p>

        <div className="wechat-qr">
          <Image
            src="/xhs-group-0511.jpg"
            alt="HA7CH RedNote group QR code"
            width={840}
            height={1434}
            priority
          />
        </div>
      </article>
    </main>
  );
}
