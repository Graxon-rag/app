import { FileWarning, Download } from "lucide-react";

export function ErrorState({
  message = "This file couldn't be previewed.",
  url,
  fileName,
}: {
  message?: string;
  url?: string;
  fileName?: string;
}) {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <FileWarning className="h-6 w-6 text-neutral-400" strokeWidth={1.75} />
      <p className="max-w-xs text-sm text-neutral-500">{message}</p>
      {url && (
        <a
          href={url}
          download={fileName}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={2} />
          Download instead
        </a>
      )}
    </div>
  );
}
