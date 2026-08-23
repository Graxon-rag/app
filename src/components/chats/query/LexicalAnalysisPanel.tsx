import React from "react";
import { FlaskConical, AlignLeft, Tag, SlidersHorizontal, Search } from "lucide-react";
import { QueryLexicalEngineAnalysisInterface } from "@/interfaces/QueryInterface";
import { Collapsible } from "./Collapsible";

interface LexicalAnalysisPanelProps {
  analysis: QueryLexicalEngineAnalysisInterface;
}

export function LexicalAnalysisPanel({ analysis }: LexicalAnalysisPanelProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden w-full">
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 flex items-center gap-2">
        <FlaskConical size={13} className="text-violet-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Lexical Analysis
        </h3>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 w-full">
        <div className="px-4 py-3 space-y-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
            Raw Query
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-200 font-medium break-words">
            {analysis.raw_query}
          </p>
        </div>

        {analysis.tokens.length > 0 && (
          <div className="px-4 py-3 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1">
              <AlignLeft size={10} /> Tokens
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.tokens.map((t, i) => (
                <span
                  key={i}
                  className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded break-all"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.entities.length > 0 && (
          <div className="px-4 py-3 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1">
              <Tag size={10} /> Entities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.entities.map((e, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 px-2 py-0.5 rounded-full"
                >
                  <span className="font-medium">{e.text}</span>
                  <span className="text-[9px] bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-200 rounded px-1 font-bold uppercase">
                    {e.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-3 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
            Query Flags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["Acronym", analysis.is_acronym_query],
                ["Single Token", analysis.is_single_token],
                ["Multi Word", analysis.is_multi_word],
              ] as [string, boolean][]
            ).map(([lbl, val]) => (
              <span
                key={lbl}
                className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${val ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700"}`}
              >
                {lbl}: {val ? "Yes" : "No"}
              </span>
            ))}
          </div>
        </div>

        {analysis.lane_priority.length > 0 && (
          <div className="px-4 py-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1">
              <SlidersHorizontal size={10} /> Lane Priority
            </p>
            {(() => {
              const maxP = Math.max(...analysis.lane_priority.map(([, v]) => v));
              return analysis.lane_priority.map(([lane, priority]) => (
                <div key={lane} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">{lane}</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {(priority ?? 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden w-full">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600"
                      style={{ width: `${maxP > 0 ? (priority / maxP) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {Object.keys(analysis.normalized_query_for_lane).length > 0 && (
          <div className="px-3 py-3 w-full">
            <Collapsible label="Normalized Queries per Lane" icon={<Search size={10} />}>
              <div className="space-y-2 w-full">
                {Object.entries(analysis.normalized_query_for_lane).map(([lane, q]) => (
                  <div
                    key={lane}
                    className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 space-y-0.5 w-full"
                  >
                    <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase">
                      {lane}
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 break-words">{q}</p>
                  </div>
                ))}
              </div>
            </Collapsible>
          </div>
        )}
      </div>
    </div>
  );
}
