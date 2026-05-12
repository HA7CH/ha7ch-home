type Params = Promise<{ slug: string }>;

export default async function OGPage({ params }: { params: Params }) {
  const { slug } = await params;
  const src = `/writing/${slug}/opengraph-image`;

  return (
    <main style={{ margin: 0, padding: 0, background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <a href={src} target="_blank">
        <img src={src} alt={slug} style={{ width: 1200, height: 630, display: "block" }} />
      </a>
    </main>
  );
}
