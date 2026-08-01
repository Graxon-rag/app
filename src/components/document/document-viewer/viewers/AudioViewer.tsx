import { Music } from "lucide-react";
import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";

export function AudioViewer({ url, fileName }: ViewerProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar url={url} fileName={fileName} />
      <div className="flex flex-col items-center justify-center gap-4 bg-neutral-50 px-6 py-10 dark:bg-neutral-900">
        <Music className="h-8 w-8 text-neutral-400" strokeWidth={1.5} />
        <audio controls src={url} className="w-full max-w-md">
          Your browser doesn't support inline audio playback.
        </audio>
      </div>
    </div>
  );
}
