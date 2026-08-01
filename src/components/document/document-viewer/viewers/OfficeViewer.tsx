import { useEffect, useRef, useState } from "react";
import { FileType2 } from "lucide-react";
import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { getExtension } from "../file-classification";

interface OfficeViewerProps extends ViewerProps {
  /**
   * Only set true if `url` is fetchable by Microsoft/Google's servers
   * (i.e. not behind auth, and won't expire in the next minute or two).
   * Presigned URLs with short TTLs will break the embed.
   */
  publiclyFetchable?: boolean;
}

type Status = "loading" | "ready" | "error" | "unsupported-client-render";

// .docx renders client-side via docx-preview. .doc (legacy binary) and
// .ppt/.pptx have no good client-side equivalent, so those always fall
// through to the embed (if publicly fetchable) or the download card.
export function OfficeViewer({ url, fileName, publiclyFetchable = false }: OfficeViewerProps) {
  const ext = getExtension(fileName);
  const canRenderClientSide = ext === ".docx";
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>(canRenderClientSide ? "loading" : "ready");

  useEffect(() => {
    if (!canRenderClientSide) return;
    let cancelled = false;

    (async () => {
      try {
        const [{ renderAsync }, res] = await Promise.all([
          import("docx-preview"),
          fetch(url),
        ]);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const blob = await res.blob();
        if (cancelled || !containerRef.current) return;
        await renderAsync(blob, containerRef.current, undefined, {
          className: "docx-preview",
          inWrapper: true,
        });
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, canRenderClientSide]);

  const embedUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar url={url} fileName={fileName} />

      {canRenderClientSide && status !== "error" && (
        <div className="relative max-h-[32rem] overflow-auto bg-neutral-100 p-4 dark:bg-neutral-900">
          {status === "loading" && <LoadingState label="Rendering document…" />}
          <div ref={containerRef} className={status === "loading" ? "hidden" : ""} />
        </div>
      )}

      {(!canRenderClientSide || status === "error") &&
        (publiclyFetchable ? (
          <iframe title={fileName} src={embedUrl} className="h-[32rem] w-full border-0" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 bg-neutral-50 px-6 py-10 dark:bg-neutral-900">
            <FileType2 className="h-8 w-8 text-neutral-400" strokeWidth={1.5} />
            <ErrorState
              message="No inline preview available for this file — it isn't reachable by an external viewer. Download to open it locally."
              url={url}
              fileName={fileName}
            />
          </div>
        ))}
    </div>
  );
}
