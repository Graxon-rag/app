import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Loader2,
  HelpCircle,
  ArrowDown,
  Activity,
  BrainCircuit,
  FlaskConical,
  Search,
  BarChart2,
  Zap,
} from "lucide-react";

import { useQueryStore } from "@/store/queryStore";
import { QueryType, QueryDepth, QueryResponse } from "@/interfaces/QueryInterface";
import { Collapsible } from "./Collapsible";
import { ToolStepItem } from "./ToolStepItem";
import { ChunkCard } from "./ChunkCard";
import { LexicalAnalysisPanel } from "./LexicalAnalysisPanel";

interface ChatQueryContainerProps {
  doc_id?: string | null;
}

export default function ChatQueryContainer({ doc_id: propDocId }: ChatQueryContainerProps) {
  const { org_id, project_id } = useParams<{ org_id: string; project_id: string }>();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chat_id");

  const doc_id = propDocId || null;

  // Zustand Store
  const { query, isLoading, isStreaming, streamedAnswer, streamedThinking, toolSteps } =
    useQueryStore();

  // Local UI State
  const [inputQuery, setInputQuery] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);

  // Query Settings
  const [queryType, setQueryType] = useState<QueryType>(QueryType.SMART);
  const [queryDepth, setQueryDepth] = useState<QueryDepth>(QueryDepth.ADVANCED);
  const [topK, setTopK] = useState<number>(5);
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || !org_id || !project_id) return;

    setResponse(null);

    const data = await query({
      org_id,
      project_id,
      chat_id: chatId || undefined, // Binds query to active chat session endpoint
      query: inputQuery,
      document_id: doc_id,
      top_k: topK,
      query_type: queryType,
      query_depth: queryDepth,
      thinking: isThinkingMode,
    });

    if (data) {
      setResponse(data as QueryResponse);
    }
  };

  const isExpert = queryType === QueryType.EXPERT;
  const isFetching = isLoading || isStreaming;
  const displayAnswer = isThinkingMode ? streamedAnswer || response?.answer : response?.answer;

  const hasLexicalChunks = !!response?.lexical_engine_chunk_ids?.length;
  const hasLexicalAnalysis = !!response?.lexical_engine_analysis;
  const hasMetadata = response?.metadata && response.metadata.length > 0;

  const isAnswerLive = isStreaming && isThinkingMode && !!streamedAnswer;
  const hasReasoning = isThinkingMode && (toolSteps.length > 0 || !!streamedThinking);

  return (
    <div className="space-y-6 w-full py-2 md:py-3 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* ── Header Settings Bar ── */}
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

      {/* ── Search Bar Input Form ── */}
      <form onSubmit={handleSearch} className="relative w-full">
        <input
          type="text"
          placeholder="Ask a question in this chat...."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isFetching}
          className="w-full pl-4 pr-12 py-3.5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder-zinc-400 dark:placeholder-zinc-500 transition"
        />
        <button
          type="submit"
          disabled={isFetching || !inputQuery.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 hover:opacity-90 transition cursor-pointer"
        >
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

      {/* ── Response Output & Details Area ── */}
      {(response || isStreaming || displayAnswer || toolSteps.length > 0) && (
        <div className="grid lg:grid-cols-3 gap-6 items-start w-full">
          <div className="lg:col-span-2 space-y-5 w-full">
            {hasReasoning && (
              <div className="space-y-3 w-full">
                {toolSteps.length > 0 && (
                  <Collapsible
                    label="Agent Tool Execution"
                    icon={<Activity size={14} />}
                    badge={
                      toolSteps.some((t) => t.status === "running") ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        toolSteps.length
                      )
                    }
                    defaultOpen
                  >
                    <div className="max-h-80 overflow-y-auto pr-1 w-full">
                      {toolSteps.map((step, idx) => (
                        <ToolStepItem key={step.id} step={step} index={idx} />
                      ))}
                    </div>
                  </Collapsible>
                )}

                {streamedThinking && (
                  <Collapsible
                    label="Thinking Process"
                    icon={<BrainCircuit size={14} />}
                    defaultOpen={isStreaming && !streamedAnswer}
                  >
                    <p className="text-sm italic text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line break-words w-full">
                      {streamedThinking}
                    </p>
                  </Collapsible>
                )}

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-zinc-200 dark:to-zinc-800" />
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                    <ArrowDown size={11} /> Final Answer
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-zinc-200 dark:via-zinc-800 to-zinc-200 dark:to-zinc-800" />
                </div>
              </div>
            )}

            <div className="p-5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <HelpCircle size={14} /> Answer Engine
                </h3>
                {isAnswerLive && (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Live
                  </span>
                )}
              </div>

              <div className="text-base leading-relaxed break-words text-zinc-800 dark:text-zinc-200 w-full prose prose-zinc dark:prose-invert max-w-none">
                {displayAnswer ? (
                  <ReactMarkdown>{displayAnswer}</ReactMarkdown>
                ) : isStreaming ? (
                  <span className="animate-pulse text-zinc-400">
                    {hasReasoning ? "Finalizing answer…" : "Agent is processing..."}
                  </span>
                ) : (
                  <span className="italic text-zinc-400">No answer generated.</span>
                )}
              </div>
            </div>

            {hasMetadata && (
              <div className="mt-10 w-full">
                <Collapsible
                  label="Grounded Sources"
                  icon={<Zap size={15} />}
                  badge={response!.metadata!.length}
                  defaultOpen={false}
                >
                  <div className="space-y-3 w-full">
                    {response!.metadata!.map((chunk, index) => (
                      <ChunkCard key={chunk.chunk_id || index} chunk={chunk} index={index} />
                    ))}
                  </div>
                </Collapsible>
              </div>
            )}
          </div>

          <div className="space-y-4 w-full overflow-hidden">
            {hasLexicalAnalysis && (
              <LexicalAnalysisPanel analysis={response!.lexical_engine_analysis!} />
            )}

            {hasLexicalChunks && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden w-full">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 flex items-center gap-2">
                  <Search size={13} className="text-zinc-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Lexical Chunk Scores
                  </h3>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 w-full">
                  {response!.lexical_engine_chunk_ids!.map((lex, index) => (
                    <div key={index} className="px-4 py-3 space-y-1.5 w-full">
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <span className="font-mono text-zinc-500 break-all text-[11px]">
                          {lex.chunk_id}
                        </span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {(lex.score ?? 0).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-[10px] text-zinc-400 w-full">
                  <BarChart2 size={11} /> Avg score calculated
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
