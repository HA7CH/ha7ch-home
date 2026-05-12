import { getAllSlugs, getArticle } from "@/content/writing";

const RATIOS = [
  { label: "1.91:1 (OG)", path: "opengraph-image", w: 600, h: 315 },
  { label: "2.35:1", path: "og-235", w: 600, h: 255 },
  { label: "1:1", path: "og-11", w: 400, h: 400 },
  { label: "combined", path: "og-combined", w: 800, h: 236 },
];

export default function OGPreview() {
  const slugs = getAllSlugs();

  return (
    <main style={{ padding: "40px", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ fontFamily: "monospace", marginBottom: "8px" }}>OG Preview</h1>
      <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#666", marginBottom: "40px" }}>
        Click any card to open the raw image.
      </p>

      {slugs.map((slug) => {
        const article = getArticle(slug);
        return (
          <div key={slug} style={{ marginBottom: "48px" }}>
            <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#333", marginBottom: "16px", fontWeight: "bold" }}>
              {article?.titleEn ?? slug}
            </p>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {RATIOS.map(({ label, path, w, h }) => (
                <div key={path}>
                  <a href={`/writing/${slug}/${path}`} target="_blank" style={{ display: "block" }}>
                    <img
                      src={`/writing/${slug}/${path}`}
                      alt={label}
                      style={{ width: `${w}px`, height: `${h}px`, objectFit: "cover", border: "1px solid #ddd", display: "block" }}
                    />
                  </a>
                  <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#999", marginTop: "4px" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </main>
  );
}
