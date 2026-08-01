import { useState } from "react";
import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";
import { ErrorState } from "./shared/ErrorState";
import { getExtension } from "../file-classification";

// Containers where inline <video> support is inconsistent across browsers.
// We still try to play them (Chrome handles some), but fall back to a
// download prompt on error instead of showing a broken player.
const RISKY_CONTAINERS = new Set([".mkv", ".avi", ".wmv", ".flv"]);

export function VideoViewer({ url, fileName }: ViewerProps) {
  const [errored, setErrored] = useState(false);
  const isRisky = RISKY_CONTAINERS.has(getExtension(fileName));

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar url={url} fileName={fileName} />
      <div className="flex items-center justify-center bg-black">
        {errored ? (
          <div className="w-full bg-white p-6 dark:bg-neutral-900">
            <ErrorState
              message={
                isRisky
                  ? "This video format isn't reliably supported for inline playback in most browsers."
                  : "Video failed to load."
              }
              url={url}
              fileName={fileName}
            />
          </div>
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video controls src={url} onError={() => setErrored(true)} className="max-h-184 w-full" />
        )}
      </div>
    </div>
  );
}
