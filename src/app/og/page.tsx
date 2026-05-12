import { getAllSlugs, getArticle } from "@/content/writing";

export default function OGPreview() {
  const slugs = getAllSlugs();

  return (
    <main style={{ padding: "40px", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ fontFamily: "monospace", marginBottom: "8px" }}>OG Preview</h1>
      <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#666", marginBottom: "40px" }}>
        Click any card to open the raw image.
      </p>

      <h2 style={{ fontFamily: "monospace", fontSize: "13px", color: "#999", marginBottom: "16px" }}>
        HOMEPAGE
      </h2>
      <a href="/opengraph-image" target="_blank" style={{ display: "block", marginBottom: "40px" }}>
        <img
          src="/opengraph-image"
          alt="Homepage OG"
          style={{ width: "600px", height: "315px", objectFit: "cover", border: "1px solid #ddd", display: "block" }}
        />
      </a>

      <h2 style={{ fontFamily: "monospace", fontSize: "13px", color: "#999", marginBottom: "16px" }}>
        WRITING ({slugs.length})
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 600px)", gap: "24px" }}>
        {slugs.map((slug) => {
          const article = getArticle(slug);
          return (
            <div key={slug}>
              <a href={`/writing/${slug}/opengraph-image`} target="_blank" style={{ display: "block" }}>
                <img
                  src={`/writing/${slug}/opengraph-image`}
                  alt={article?.titleEn ?? slug}
                  style={{ width: "600px", height: "315px", objectFit: "cover", border: "1px solid #ddd", display: "block" }}
                />
              </a>
              <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#666", marginTop: "6px" }}>
                {slug}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
