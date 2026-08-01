import { useEffect, useState } from "react";
import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { getPrismLanguage } from "../file-classification";

export function CodeViewer({
  url,
  fileName,
  hideToolbar = false,
}: ViewerProps & { hideToolbar?: boolean }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [Highlighter, setHighlighter] = useState<any>(null);
  const [style, setStyle] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [res, mod, styles] = await Promise.all([
          fetch(url),
          import("react-syntax-highlighter"),
          import("react-syntax-highlighter/dist/esm/styles/prism"),
        ]);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const body = await res.text();
        if (cancelled) return;
        setHighlighter(() => mod.Prism);
        setStyle(styles.oneLight);
        setText(body);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div
      className={
        hideToolbar
          ? "flex flex-col overflow-hidden"
          : "flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
      }
    >
      {!hideToolbar && <Toolbar url={url} fileName={fileName} />}
      <div className="max-h-184 overflow-auto">
        {error && <ErrorState message="Couldn't load this file." url={url} fileName={fileName} />}
        {!error && (text === null || !Highlighter) && <LoadingState label="Loading source…" />}
        {!error && text !== null && Highlighter && (
          <Highlighter
            language={getPrismLanguage(fileName)}
            style={style}
            showLineNumbers
            customStyle={{ margin: 0, fontSize: "0.8125rem", borderRadius: 0 }}
          >
            {text}
          </Highlighter>
        )}
      </div>
    </div>
  );
}
