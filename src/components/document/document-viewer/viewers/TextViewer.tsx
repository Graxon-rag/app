import { useEffect, useState } from "react";
import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";

export function TextViewer({ url, fileName }: ViewerProps) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const body = await res.text();
        if (!cancelled) setText(body);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar url={url} fileName={fileName} />
      <div className="max-h-184 overflow-auto bg-white dark:bg-neutral-950">
        {error && <ErrorState message="Couldn't load this file." url={url} fileName={fileName} />}
        {!error && text === null && <LoadingState label="Loading text…" />}
        {!error && text !== null && (
          <pre className="whitespace-pre-wrap p-4 font-mono text-xs text-neutral-700 dark:text-neutral-300">
            {text}
          </pre>
        )}
      </div>
    </div>
  );
}
