import { useEffect, useState } from "react";
import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";

// react-json-view-lite is dependency-light and has no peer-dep footguns
// (the original react-json-view is unmaintained). Swap freely if your
// project already standardizes on something else.
export function JsonViewer({ url, fileName }: ViewerProps) {
  const [data, setData] = useState<unknown>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const text = await res.text();
        const parsed = JSON.parse(text);
        if (!cancelled) setData(parsed);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Invalid JSON");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar url={url} fileName={fileName} />
      <div className="max-h-184 overflow-auto bg-white p-4 dark:bg-neutral-950">
        {error && (
          <ErrorState message={`Couldn't parse JSON: ${error}`} url={url} fileName={fileName} />
        )}
        {!error && data === undefined && <LoadingState label="Loading JSON…" />}
        {!error && data !== undefined && <JsonTree value={data} />}
      </div>
    </div>
  );
}

// Minimal dependency-free collapsible tree — swap for react-json-view-lite
// or react-json-tree if you want search/copy-path features out of the box.
function JsonTree({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);

  if (value === null) return <span className="text-neutral-400">null</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-neutral-400">[]</span>;
    return (
      <span>
        <button
          onClick={() => setOpen(!open)}
          className="font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          {open ? "▾" : "▸"} [{value.length}]
        </button>
        {open && (
          <div className="ml-4 border-l border-neutral-100 pl-3 dark:border-neutral-800">
            {value.map((item, i) => (
              <div key={i}>
                <JsonTree value={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-neutral-400">{"{}"}</span>;
    return (
      <span>
        <button
          onClick={() => setOpen(!open)}
          className="font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          {open ? "▾" : "▸"} {"{" + entries.length + "}"}
        </button>
        {open && (
          <div className="ml-4 border-l border-neutral-100 pl-3 dark:border-neutral-800">
            {entries.map(([key, val]) => (
              <div key={key}>
                <span className="text-sky-700 dark:text-sky-400">{key}</span>
                <span className="text-neutral-400">: </span>
                <JsonTree value={val} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  if (typeof value === "string")
    return <span className="text-emerald-700 dark:text-emerald-400">"{value}"</span>;
  if (typeof value === "number")
    return <span className="text-amber-700 dark:text-amber-400">{value}</span>;
  if (typeof value === "boolean")
    return <span className="text-purple-700 dark:text-purple-400">{String(value)}</span>;
  return <span>{String(value)}</span>;
}
