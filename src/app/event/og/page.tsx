import { createStore } from "@/lib/event/store";

// Preview grid for the event OG cards, mirroring /og for writing: every event rendered in each
// ratio, click any card to open the raw image. Reads events from Supabase; falls back to the two
// known slugs if the store is unreachable so the page still renders.
export const dynamic = "force-dynamic";

const RATIOS = [
  { label: "1.91:1 (OG)", path: "opengraph-image", w: 600, h: 315 },
  { label: "2.35:1", path: "og-235", w: 600, h: 255 },
  { label: "1:1", path: "og-11", w: 400, h: 400 },
  { label: "combined", path: "og-combined", w: 800, h: 236 },
];

async function listEvents(): Promise<{ slug: string; name: string }[]> {
  try {
    const rows = await createStore().listEvents();
    if (rows.length) return rows.map((e) => ({ slug: e.event_id, name: e.name }));
  } catch {
    /* fall through */
  }
  return [
    { slug: "shanghai-fde-2026", name: "shanghai-fde-2026" },
    { slug: "shenzhen-2026", name: "shenzhen-2026" },
  ];
}

export default async function EventOGPreview() {
  const events = await listEvents();

  return (
    <main style={{ padding: "40px", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ fontFamily: "monospace", marginBottom: "8px" }}>Event OG Preview</h1>
      <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#666", marginBottom: "40px" }}>
        Click any card to open the raw image.
      </p>

      {events.map(({ slug, name }) => (
        <div key={slug} style={{ marginBottom: "48px" }}>
          <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#333", marginBottom: "16px", fontWeight: "bold" }}>
            {name} <span style={{ color: "#999", fontWeight: "normal" }}>/event/{slug}</span>
          </p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {RATIOS.map(({ label, path, w, h }) => (
              <div key={path}>
                <a href={`/event/${slug}/${path}`} target="_blank" style={{ display: "block" }}>
                  <img
                    src={`/event/${slug}/${path}`}
                    alt={label}
                    style={{ width: `${w}px`, height: `${h}px`, objectFit: "cover", border: "1px solid #ddd", display: "block" }}
                  />
                </a>
                <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#999", marginTop: "4px" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
