// Server-side helper to start a WeChat pairing session on the worker (event.ha7ch.com) and pull
// back the live iLink QR, so the event page can render that QR as a TOP-LEVEL <img> instead of
// embedding the worker page in a cross-origin iframe.
//
// Why this matters: WeChat's in-app browser "长按识别图中二维码" only works on <img> elements in
// the top document. A QR inside a cross-origin iframe (the old approach) can't be long-pressed to
// recognize — you only get a plain image menu. Rendering it top-level fixes that. A cross-origin
// image SRC is fine (proven by pages whose QR loads from a third-party CDN); only the iframe nesting
// breaks it.
//
// NOTE: the worker currently only exposes the session + QR baked into its /apply HTML, so we scrape
// it here. When the worker is slimmed to a thin bridge it should expose this as JSON (+ CORS), and
// this scrape can go away.

export const PAIRING_WORKER_ORIGIN = "https://event.ha7ch.com";

export interface Pairing {
  session: string;
  qrUrl: string;
}

export async function fetchPairingSession(): Promise<Pairing | null> {
  try {
    const res = await fetch(`${PAIRING_WORKER_ORIGIN}/apply?embed=1`, { cache: "no-store" });
    if (!res.ok) return null;
    const html = await res.text();
    const session = html.match(/SESSION\s*=\s*"([^"]+)"/)?.[1];
    const qrUrl = html.match(/qrImg\.src\s*=\s*"([^"]+)"/)?.[1];
    if (!session || !qrUrl) return null;
    return { session, qrUrl };
  } catch {
    return null;
  }
}
