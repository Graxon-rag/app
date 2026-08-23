import React from "react";
import ReactMarkdown from "react-markdown";
import {
  HelpCircle,
  ArrowDown,
  Activity,
  BrainCircuit,
  Search,
  BarChart2,
  Zap,
  Loader2,
} from "lucide-react";
import { QueryResponse } from "@/interfaces/QueryInterface";
import { Collapsible } from "./Collapsible";
import { ToolStepItem, ToolStepData } from "./ToolStepItem";
import { ChunkCard } from "./ChunkCard";
import { LexicalAnalysisPanel } from "./LexicalAnalysisPanel";

interface ChatLiveResponseProps {
  response: QueryResponse | null;
  isStreaming: boolean;
  displayAnswer?: string;
  streamedThinking: string;
  toolSteps: ToolStepData[];
  isThinkingMode: boolean;
}

export function ChatLiveResponse({
  response,
  isStreaming,
  displayAnswer,
  streamedThinking,
  toolSteps,
  isThinkingMode,
}: ChatLiveResponseProps) {
  if (!response && !isStreaming && !displayAnswer && toolSteps.length === 0) return null;

  const hasLexicalChunks = !!response?.lexical_engine_chunk_ids?.length;
  const hasLexicalAnalysis = !!response?.lexical_engine_analysis;
  const hasMetadata = response?.metadata && response.metadata.length > 0;
  const isAnswerLive = isStreaming && isThinkingMode && !!displayAnswer;
  const hasReasoning = isThinkingMode && (toolSteps.length > 0 || !!streamedThinking);

  return (
    <div className="grid lg:grid-cols-3 gap-6 items-start w-full border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-4">
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
                defaultOpen={isStreaming && !displayAnswer}
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
                </span>{" "}
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
  );
}
