import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";

export function MarkdownViewer({ url, fileName }: ViewerProps) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [ReactMarkdown, setReactMarkdown] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [res, mod] = await Promise.all([fetch(url), import("react-markdown")]);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const body = await res.text();
        if (cancelled) return;
        setReactMarkdown(() => mod.default);
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
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar url={url} fileName={fileName} />

      {error && <ErrorState message="Couldn't load this file." url={url} fileName={fileName} />}
      {!error && (text === null || !ReactMarkdown) && <LoadingState label="Loading markdown…" />}

      {!error && text !== null && ReactMarkdown && (
        <Tabs.Root defaultValue="rendered" className="flex flex-col">
          <Tabs.List className="flex gap-1 border-b border-neutral-200 bg-neutral-50 px-2 dark:border-neutral-800 dark:bg-neutral-900">
            {["rendered", "source"].map((tab) => (
              <Tabs.Trigger
                key={tab}
                value={tab}
                className="shrink-0 border-b-2 border-transparent px-3 py-2 text-xs font-medium capitalize text-neutral-500 transition-colors data-[state=active]:border-neutral-900 data-[state=active]:text-neutral-900 dark:data-[state=active]:border-neutral-100 dark:data-[state=active]:text-neutral-100"
              >
                {tab}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content
            value="rendered"
            className="prose prose-sm max-h-[32rem] max-w-none overflow-auto p-4 dark:prose-invert"
          >
            <ReactMarkdown>{text}</ReactMarkdown>
          </Tabs.Content>
          <Tabs.Content value="source" className="max-h-[32rem] overflow-auto">
            <pre className="whitespace-pre-wrap p-4 font-mono text-xs text-neutral-700 dark:text-neutral-300">
              {text}
            </pre>
          </Tabs.Content>
        </Tabs.Root>
      )}
    </div>
  );
}
