import React, { useState, useRef, useEffect } from "react";
import {
  BrainCircuit,
  Settings2,
  PanelLeftClose,
  PanelLeft,
  SlidersHorizontal,
} from "lucide-react";
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
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
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
  isSidebarOpen,
  toggleSidebar,
}: ChatSettingsBarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md cursor-pointer text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
            <BrainCircuit className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            {chatId ? "Active Session" : "Chat Assistant"}
          </h1>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-md transition-colors cursor-pointer ${showSettings ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
          title="Settings"
        >
          <Settings2 size={18} />
        </button>

        {showSettings && (
          <div className="absolute right-0 mt-2 w-72 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 space-y-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <SlidersHorizontal size={14} className="text-zinc-400 cup" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Query Settings
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-semibold text-zinc-400">
                  Agent Mode
                </label>
                <button
                  type="button"
                  onClick={() => setIsThinkingMode(!isThinkingMode)}
                  className={`w-full flex items-center justify-center gap-2 h-9 rounded-lg border text-sm font-semibold transition-colors ${
                    isThinkingMode
                      ? "bg-primary-50 dark:bg-primary-900/30 cursor-pointer border-primary-500 text-primary-700 dark:text-primary-300"
                      : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <BrainCircuit size={16} />{" "}
                  {isThinkingMode ? "Thinking Enabled" : "Thinking Disabled"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-semibold text-zinc-400">Type</label>
                  <select
                    value={queryType}
                    onChange={(e) => setQueryType(e.target.value as QueryType)}
                    className="w-full px-2 h-9 cursor-pointer text-xs rounded-lg border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 outline-none"
                  >
                    <option value={QueryType.QUICK}>Quick</option>
                    <option value={QueryType.SMART}>Smart</option>
                    <option value={QueryType.EXPERT}>Expert</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] cursor-pointer uppercase font-semibold text-zinc-400">
                    Top K
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="w-full px-2 h-9 text-xs rounded-lg border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-semibold text-zinc-400">Depth</label>
                <select
                  value={queryDepth}
                  onChange={(e) => setQueryDepth(e.target.value as QueryDepth)}
                  className="w-full px-2 h-9 cursor-pointer text-xs rounded-lg border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 outline-none"
                >
                  <option value={QueryDepth.STANDARD}>Standard</option>
                  <option value={QueryDepth.ADVANCED}>Advanced</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
