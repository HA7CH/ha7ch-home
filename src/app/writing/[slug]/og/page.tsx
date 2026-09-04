type Params = Promise<{ slug: string }>;

export default async function OGPage({ params }: { params: Params }) {
  const { slug } = await params;
  const src = `/writing/${slug}/opengraph-image`;

  return (
    <main style={{ margin: 0, padding: 0, background: "#000", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <a href={src} target="_blank" style={{ display: "block", maxWidth: "100%" }}>
        <img src={src} alt={slug} style={{ width: 1200, maxWidth: "100%", height: "auto", aspectRatio: "1200 / 630", display: "block" }} />
      </a>
    </main>
  );
}
