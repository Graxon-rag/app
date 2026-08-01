import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";

// Every modern browser ships a built-in PDF renderer, so an iframe is
// the simplest path — no client-side library needed. If you later want
// thumbnails, a page-jump UI, or in-doc search, swap this for pdf.js
// (or the react-pdf wrapper) without touching the rest of the tree.
export function PdfViewer({ url, fileName }: ViewerProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar
        url={url}
        fileName={fileName}
        fullscreenContent={<iframe title={fileName} src={url} className="h-full w-full border-0" />}
      />
      <iframe title={fileName} src={url} className="h-screen w-full border-0" />
    </div>
  );
}
