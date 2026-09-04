import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HA7CH 公众号",
  description: "微信扫码关注 HA7CH 公众号。",
  alternates: { canonical: "/wechat" }
};

export default function WeChat() {
  return (
    <main className="homepage department-page" lang="zh-CN">
      <nav className="department-back"><Link className="basic-link" href="/">HA7CH</Link><span> / 公众号</span></nav>
      <article className="article">
        <header><h1 className="department-heading">HA7CH 公众号</h1></header>
        <p>使用微信扫一扫关注。也可以保存二维码，在微信「扫一扫」中从相册选择。</p>
        <div className="wechat-qr official-wechat-qr">
          <Image src="/ha7ch-wechat-official.jpg" alt="HA7CH 微信公众号二维码" width={430} height={430} priority unoptimized />
        </div>
        <p><a className="basic-link" href="/ha7ch-wechat-official.jpg" download="HA7CH-公众号.jpg">保存二维码</a></p>
      </article>
    </main>
  );
}
