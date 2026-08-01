import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";
import { ErrorState } from "./shared/ErrorState";

export function UnsupportedViewer({ url, fileName }: ViewerProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar url={url} fileName={fileName} />
      <div className="p-4">
        <ErrorState
          message="No preview is available for this file type yet."
          url={url}
          fileName={fileName}
        />
      </div>
    </div>
  );
}
