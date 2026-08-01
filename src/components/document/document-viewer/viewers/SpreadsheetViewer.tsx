import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import type { ViewerProps } from "../types";
import { Toolbar } from "./shared/Toolbar";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { getExtension } from "../file-classification";

interface SheetData {
  name: string;
  rows: string[][];
}

const MAX_ROWS = 500; // guard against rendering huge sheets into the DOM

function Table({ rows }: { rows: string[][] }) {
  if (rows.length === 0) {
    return <p className="p-4 text-sm text-neutral-500">This sheet is empty.</p>;
  }
  const [header, ...body] = rows;
  return (
    // Moved max-h-[32rem] here so overflow-auto knows when to trigger the scrollbar
    <div className="max-h-184 overflow-auto">
      <table className="w-full border-collapse text-left text-sm">
        {/* Added z-10 so the sticky header stays visually above scrolling content */}
        <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-neutral-800">
          <tr>
            {header.map((cell, i) => (
              <th
                key={i}
                className="whitespace-nowrap border-b border-neutral-200 px-3 py-2 font-semibold text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
              >
                {cell || "\u00A0"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.slice(0, MAX_ROWS).map((row, r) => (
            <tr
              key={r}
              className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-900 dark:even:bg-neutral-900/50"
            >
              {row.map((cell, c) => (
                <td
                  key={c}
                  className="whitespace-nowrap border-b border-neutral-100 px-3 py-1.5 text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {body.length > MAX_ROWS && (
        <p className="border-t border-neutral-200 px-3 py-2 text-xs text-neutral-400 dark:border-neutral-800">
          Showing first {MAX_ROWS.toLocaleString()} of {body.length.toLocaleString()} rows —
          download the file to see the rest.
        </p>
      )}
    </div>
  );
}

export function SpreadsheetViewer({ url, fileName }: ViewerProps) {
  const [sheets, setSheets] = useState<SheetData[] | null>(null);
  const [error, setError] = useState(false);
  const isCsv = getExtension(fileName) === ".csv";

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        if (isCsv) {
          const Papa = (await import("papaparse")).default;
          const text = await res.text();
          const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
          if (cancelled) return;
          setSheets([{ name: fileName, rows: parsed.data }]);
        } else {
          const XLSX = await import("xlsx");
          const buf = await res.arrayBuffer();
          const wb = XLSX.read(buf, { type: "array" });
          if (cancelled) return;
          setSheets(
            wb.SheetNames.map((name) => ({
              name,
              rows: XLSX.utils.sheet_to_json(wb.Sheets[name], {
                header: 1,
                blankrows: false,
              }) as string[][],
            })),
          );
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, fileName, isCsv]);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Toolbar url={url} fileName={fileName} />
      {error && (
        <ErrorState message="Couldn't parse this spreadsheet." url={url} fileName={fileName} />
      )}
      {!error && !sheets && <LoadingState label="Parsing spreadsheet…" />}

      {/* Removed the redundant max-h-[32rem] wrapper divs here */}
      {!error && sheets && sheets.length === 1 && <Table rows={sheets[0].rows} />}
      {!error && sheets && sheets.length > 1 && (
        <Tabs.Root defaultValue={sheets[0].name} className="flex flex-col">
          <Tabs.List className="flex gap-1 overflow-x-auto border-b border-neutral-200 bg-neutral-50 px-2 dark:border-neutral-800 dark:bg-neutral-900">
            {sheets.map((s) => (
              <Tabs.Trigger
                key={s.name}
                value={s.name}
                className="shrink-0 border-b-2 border-transparent px-3 py-2 text-xs font-medium text-neutral-500 transition-colors data-[state=active]:border-neutral-900 data-[state=active]:text-neutral-900 dark:data-[state=active]:border-neutral-100 dark:data-[state=active]:text-neutral-100"
              >
                {s.name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {sheets.map((s) => (
            <Tabs.Content key={s.name} value={s.name} className="outline-none">
              <Table rows={s.rows} />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}
    </div>
  );
}
