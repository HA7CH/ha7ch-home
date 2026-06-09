"use client";

import { useEffect, useRef, useState } from "react";

// Live WeChat pairing QR, rendered as a TOP-LEVEL <img> (not in an iframe) so WeChat's
// "长按识别图中二维码" works. Mirrors the worker's embed widget: poll the (proxied) status
// endpoint, swap the QR when it rotates, reflect scan/activation/expiry. Swapping img.src via JS
// keeps long-press recognition working.

type StatusData = { status?: string; qr_url?: string };

export default function EventPairing({ session, initialQrUrl }: { session: string; initialQrUrl: string }) {
  const [qrUrl, setQrUrl] = useState(initialQrUrl);
  const [hint, setHint] = useState("");
  const [hintCls, setHintCls] = useState("");
  const [dim, setDim] = useState(false);
  const [showRefresh, setShowRefresh] = useState(false);
  const stopped = useRef(false);

  useEffect(() => {
    stopped.current = false;
    const scanMsg = "微信扫码，进 bot 跟 bouncer 聊两句就能报名";
    setHint(scanMsg);

    let timer: ReturnType<typeof setTimeout> | undefined;

    const handle = (data: StatusData) => {
      const s = data?.status;
      if (s === "new_qr" && data.qr_url) {
        setQrUrl(data.qr_url);
        setDim(false);
        setHint("二维码已刷新，请重新扫码");
        setHintCls("");
        setShowRefresh(false);
        return;
      }
      switch (s) {
        case "wait":
        case "scaned":
          setHint(scanMsg);
          setHintCls("");
          break;
        case "confirmed":
          setHint("扫码成功，正在进入对话");
          setHintCls("");
          break;
        case "activated":
          setDim(true);
          setHint("成了，回微信和 bouncer 聊两句");
          setHintCls("good");
          stopped.current = true;
          break;
        case "expired":
        case "timed_out":
          setDim(true);
          setHint("二维码失效了，刷新一下重试");
          setHintCls("bad");
          setShowRefresh(true);
          stopped.current = true;
          break;
        default:
          setHint(scanMsg);
          setHintCls("");
      }
    };

    const poll = async () => {
      if (stopped.current) return;
      try {
        const r = await fetch(`/api/event-pairing/status?s=${encodeURIComponent(session)}`, { cache: "no-store" });
        handle((await r.json()) as StatusData);
      } catch {
        /* transient — keep polling */
      }
      if (!stopped.current) timer = setTimeout(poll, 2500);
    };
    poll();

    return () => {
      stopped.current = true;
      if (timer) clearTimeout(timer);
    };
  }, [session]);

  return (
    <div className="event-pair">
      <div className={`event-pair-card${dim ? " dim" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="event-pair-qr" src={qrUrl} alt="微信报名二维码" />
      </div>
      <p className={`event-pair-hint${hintCls ? " " + hintCls : ""}`}>
        {hint}
      </p>
      {showRefresh ? (
        <button className="event-pair-refresh" onClick={() => location.reload()}>
          刷新二维码
        </button>
      ) : null}
    </div>
  );
}
