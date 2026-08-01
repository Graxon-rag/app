import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";
import { CodeViewer } from "./CodeViewer";

// Source view is the default and primary use case for a "document viewer" —
// most people opening an .html file from a doc list want to read the
// markup, not have it silently executed. The rendered tab is opt-in and
// sandboxed with no same-origin/scripts to avoid running untrusted content.
export function HtmlViewer({ url, fileName }: ViewerProps) {
  const [tab, setTab] = useState<"source" | "rendered">("source");

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar url={url} fileName={fileName} />
      <Tabs.Root value={tab} onValueChange={(v) => setTab(v as "source" | "rendered")}>
        <Tabs.List className="flex gap-1 border-b border-neutral-200 bg-neutral-50 px-2 dark:border-neutral-800 dark:bg-neutral-900">
          <Tabs.Trigger
            value="source"
            className="shrink-0 border-b-2 border-transparent px-3 py-2 text-xs font-medium text-neutral-500 transition-colors data-[state=active]:border-neutral-900 data-[state=active]:text-neutral-900 dark:data-[state=active]:border-neutral-100 dark:data-[state=active]:text-neutral-100"
          >
            Source
          </Tabs.Trigger>
          <Tabs.Trigger
            value="rendered"
            className="shrink-0 border-b-2 border-transparent px-3 py-2 text-xs font-medium text-neutral-500 transition-colors data-[state=active]:border-neutral-900 data-[state=active]:text-neutral-900 dark:data-[state=active]:border-neutral-100 dark:data-[state=active]:text-neutral-100"
          >
            Rendered preview
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="source">
          <CodeViewer url={url} fileName={fileName} hideToolbar />
        </Tabs.Content>
        <Tabs.Content value="rendered">
          <iframe
            title={`${fileName} preview`}
            src={url}
            sandbox=""
            className="h-[32rem] w-full border-0 bg-white"
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
