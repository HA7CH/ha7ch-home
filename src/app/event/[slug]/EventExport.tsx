"use client";

import { useState } from "react";

// Export button for an event page, mirroring the writing article export: fetch each 3:4 card
// (cover + content) from the OG route, then download a single PNG or zip the set.
export default function EventExport({ slug, cardCount }: { slug: string; cardCount: number }) {
  const [exporting, setExporting] = useState(false);

  async function exportCards() {
    if (exporting || cardCount <= 0) return;
    setExporting(true);
    try {
      const blobs = await Promise.all(
        Array.from({ length: cardCount }, (_, i) =>
          fetch(`/event/${slug}/cards/${i}`).then((r) => {
            if (!r.ok) throw new Error(`Failed to fetch card ${i}`);
            return r.blob();
          })
        )
      );

      if (blobs.length === 1) {
        triggerDownload(blobs[0], `${slug}.png`);
        return;
      }

      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      blobs.forEach((b, i) => {
        zip.file(`${String(i + 1).padStart(2, "0")}.png`, b);
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      triggerDownload(zipBlob, `${slug}.zip`);
    } catch (err) {
      console.error(err);
      alert("Export failed. Check console.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      className="export-btn"
      onClick={exportCards}
      disabled={exporting}
      aria-label="Export event as images"
      title="Export as images"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2.5" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </button>
  );
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
