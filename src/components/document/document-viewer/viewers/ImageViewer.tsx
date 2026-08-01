import { useState } from "react";
import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";

export function ImageViewer({ url, fileName }: ViewerProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar
        url={url}
        fileName={fileName}
        fullscreenContent={
          <div className="flex h-full w-full items-center justify-center p-4">
            <img src={url} alt={fileName} className="max-h-full max-w-full object-contain" />
          </div>
        }
      />
      <div className="relative flex min-h-[16rem] items-center justify-center bg-[repeating-conic-gradient(#f3f4f6_0%_25%,white_0%_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(#27272a_0%_25%,#18181b_0%_50%)] p-4">
        {!loaded && !errored && (
          <div className="absolute inset-0">
            <LoadingState label="Loading image…" />
          </div>
        )}
        {errored ? (
          <ErrorState message="Image failed to load." url={url} fileName={fileName} />
        ) : (
          <img
            src={url}
            alt={fileName}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={`max-h-184 max-w-full object-contain transition-opacity ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
    </div>
  );
}
