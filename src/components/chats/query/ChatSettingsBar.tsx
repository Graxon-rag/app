import React from "react";
import { BrainCircuit, FlaskConical } from "lucide-react";
import { QueryType, QueryDepth } from "@/interfaces/QueryInterface";

interface ChatSettingsBarProps {
  chatId: string | null;
  queryType: QueryType;
  setQueryType: (val: QueryType) => void;
  queryDepth: QueryDepth;
  setQueryDepth: (val: QueryDepth) => void;
  topK: number;
  setTopK: (val: number) => void;
  isThinkingMode: boolean;
  setIsThinkingMode: (val: boolean) => void;
}

export function ChatSettingsBar({
  chatId,
  queryType,
  setQueryType,
  queryDepth,
  setQueryDepth,
  topK,
  setTopK,
  isThinkingMode,
  setIsThinkingMode,
}: ChatSettingsBarProps) {
  const isExpert = queryType === QueryType.EXPERT;

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Chat Query Assistant
          </h1>
          {chatId && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Active Chat ID:{" "}
              <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                {chatId}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              Type
            </label>
            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value as QueryType)}
              className="px-3 py-2 h-9 text-sm rounded-lg cursor-pointer border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:outline-none"
            >
              <option value={QueryType.QUICK}>Quick</option>
              <option value={QueryType.SMART}>Smart</option>
              <option value={QueryType.EXPERT}>Expert</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              Depth
            </label>
            <select
              value={queryDepth}
              onChange={(e) => setQueryDepth(e.target.value as QueryDepth)}
              className="px-3 py-2 h-9 text-sm rounded-lg cursor-pointer border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:outline-none"
            >
              <option value={QueryDepth.STANDARD}>Standard</option>
              <option value={QueryDepth.ADVANCED}>Advanced</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              Top K
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-20 px-3 py-2 h-9 text-sm rounded-lg border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              Agent Mode
            </label>
            <button
              type="button"
              onClick={() => setIsThinkingMode(!isThinkingMode)}
              className={`flex cursor-pointer items-center gap-2 h-9 px-3 rounded-lg border text-sm font-semibold transition-colors ${
                isThinkingMode
                  ? "bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <BrainCircuit size={16} /> Thinking
            </button>
          </div>
        </div>
      </div>

      {isExpert && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-xs text-violet-700 dark:text-violet-300">
          <FlaskConical size={13} />
          <strong>Expert mode</strong> — Lexical engine analysis will be included.
        </div>
      )}
    </div>
  );
}
