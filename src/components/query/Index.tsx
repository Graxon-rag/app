import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Loader2,
  FileText,
  Hash,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  GitBranch,
  Search,
  BarChart2,
  Zap,
  Tag,
  AlignLeft,
  SlidersHorizontal,
  FlaskConical,
  BrainCircuit,
  Activity,
  CheckCircle2,
} from "lucide-react";

import { useQueryStore } from "@/store/queryStore";
import {
  QueryType,
  QueryDepth,
  QueryResponse,
  QueryMetadataInterface,
  QueryLexicalEngineAnalysisInterface,
} from "@/interfaces/QueryInterface";

// ─── Collapsible ─────────────────────────────────────────────────────────────

function Collapsible({
  label,
  icon,
  defaultOpen = false,
  badge,
  children,
  headerClassName = "",
}: {
  label: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number | React.ReactNode;
  children: React.ReactNode;
  headerClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden w-full">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors
          bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/70
          text-zinc-500 dark:text-zinc-400 ${headerClassName}`}
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {label}

          {badge !== undefined && (
            <span className="ml-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none flex items-center justify-center">
              {badge}
            </span>
          )}
        </span>

        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && <div className="p-3 bg-white dark:bg-zinc-950 w-full">{children}</div>}
    </div>
  );
}

// ─── Tool Step Item ──────────────────────────────────────────────────────────

function ToolStepItem({
  step,
  index,
}: {
  step: {
    name: string;
    input: string;
    output: string;
    status: "running" | "done";
  };
  index: number;
}) {
  return (
    <div className="mb-2 last:mb-0 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden w-full">
      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono text-zinc-600 dark:text-zinc-300">
          <span className="text-zinc-400">[{index + 1}]</span>

          <span className="font-semibold text-blue-600 dark:text-blue-400">{step.name}</span>
        </div>

        {step.status === "running" ? (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500">
            <Loader2 size={10} className="animate-spin" />
            Running
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-500">
            <CheckCircle2 size={10} />
            Done
          </span>
        )}
      </div>

      <div className="p-3 text-[11px] font-mono text-zinc-500 space-y-2 w-full">
        <div className="w-full">
          <span className="font-bold text-zinc-400 uppercase">Input:</span>

          <p className="mt-1 break-words whitespace-pre-wrap bg-white dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-800 w-full">
            {step.input || "No input"}
          </p>
        </div>

        {step.output && (
          <div className="w-full">
            <span className="font-bold text-zinc-400 uppercase">Result:</span>

            <div className="mt-1 break-words whitespace-pre-wrap bg-white dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-800 max-h-60 overflow-y-auto w-full">
              {step.output}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Adjacent Chunk ──────────────────────────────────────────────────────────

function AdjacentChunkPanel({
  label,
  icon,
  accentColor,
  chunk,
}: {
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  chunk: {
    chunk_id: string;
    text: string;
    chunk_number: number;
    weight: number;
  };
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden w-full">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-xs"
      >
        <span className={`flex items-center gap-1.5 font-semibold ${accentColor}`}>
          {icon}

          {label}

          <span className="font-mono text-zinc-400 dark:text-zinc-500 font-normal">
            — Chunk {chunk.chunk_number}
          </span>
        </span>

        <span className="flex items-center gap-2 text-zinc-400">
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>

      {open && (
        <div className="p-3 bg-white dark:bg-zinc-950 space-y-2 w-full">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-400 font-mono border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <span>
              ID:{" "}
              <span className="text-zinc-600 dark:text-zinc-300 break-all">{chunk.chunk_id}</span>
            </span>

            <span>
              Weight:{" "}
              <strong className="text-zinc-700 dark:text-zinc-200">
                {(chunk.weight ?? 0).toFixed(4)}
              </strong>
            </span>
          </div>

          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap break-words">
            {chunk.text}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Vector Similar Chunk ────────────────────────────────────────────────────

function VecSimilarChunkItem({
  vc,
  index,
}: {
  vc: {
    chunk_id: string;
    text: string;
    chunk_number: number;
    weight: number;
  };
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden w-full">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-50/80 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition text-xs"
      >
        <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded px-1.5 py-0.5 text-[10px] font-bold">
            {index + 1}
          </span>

          <span className="font-semibold">Chunk {vc.chunk_number}</span>

          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
            {vc.chunk_id}
          </span>
        </span>

        <span className="flex items-center gap-2">
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold text-[10px]">
            w {(vc.weight ?? 0).toFixed(4)}
          </span>

          {open ? (
            <ChevronUp size={12} className="text-zinc-400" />
          ) : (
            <ChevronDown size={12} className="text-zinc-400" />
          )}
        </span>
      </button>

      {open && (
        <div className="p-3 bg-white dark:bg-zinc-950 space-y-2 w-full">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-400 font-mono border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <span>
              ID: <span className="text-zinc-600 dark:text-zinc-300 break-all">{vc.chunk_id}</span>
            </span>

            <span>
              Chunk: <strong className="text-zinc-700 dark:text-zinc-200">{vc.chunk_number}</strong>
            </span>

            <span>
              Weight:{" "}
              <strong className="text-zinc-700 dark:text-zinc-200">
                {(vc.weight ?? 0).toFixed(4)}
              </strong>
            </span>
          </div>

          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap break-words">
            {vc.text}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Chunk Card ──────────────────────────────────────────────────────────────

function ChunkCard({ chunk, index }: { chunk: QueryMetadataInterface; index: number }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const hasPrev = !!chunk.prev_chunk;
  const hasNext = !!chunk.next_chunk;
  const hasVecSim = !!chunk.vector_similar_chunks?.length;
  const hasExtra = hasPrev || hasNext || hasVecSim;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm w-full">
      <div className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <Hash size={13} className="text-zinc-400 flex-shrink-0" />
            Chunk {chunk.chunk_number}
          </div>

          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 break-all">
            {chunk.chunk_id}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500 flex-shrink-0">
          <span>
            Weight{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">
              {(chunk.weight ?? 0).toFixed(4)}
            </strong>
          </span>

          <span>
            Score{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">
              {(chunk.point_score ?? 0).toFixed(4)}
            </strong>
          </span>

          {hasExtra && (
            <button
              type="button"
              onClick={() => setDetailsOpen((p) => !p)}
              className="flex cursor-pointer items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 transition text-[11px] font-semibold"
            >
              {detailsOpen ? (
                <>
                  <ChevronUp size={11} />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown size={11} />
                  Details
                  {hasVecSim && (
                    <span className="ml-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full px-1.5 text-[9px] font-bold">
                      {chunk.vector_similar_chunks!.length} sim
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 w-full">
        <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap break-words bg-zinc-50/60 dark:bg-zinc-950/40 p-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700/60">
          {chunk.text}
        </p>
      </div>

      {detailsOpen && hasExtra && (
        <div className="px-4 pb-4 space-y-2.5 w-full">
          {hasPrev && chunk.prev_chunk && (
            <AdjacentChunkPanel
              label="Previous Chunk"
              icon={<ArrowLeft size={12} />}
              accentColor="text-amber-500 dark:text-amber-400"
              chunk={chunk.prev_chunk}
            />
          )}

          {hasNext && chunk.next_chunk && (
            <AdjacentChunkPanel
              label="Next Chunk"
              icon={<ArrowRight size={12} />}
              accentColor="text-sky-500 dark:text-sky-400"
              chunk={chunk.next_chunk}
            />
          )}

          {hasVecSim && (
            <Collapsible
              label="Vector Similar Chunks"
              icon={<GitBranch size={12} />}
              badge={chunk.vector_similar_chunks!.length}
              defaultOpen={false}
            >
              <div className="space-y-2">
                {chunk.vector_similar_chunks!.map((vc, vi) => (
                  <VecSimilarChunkItem key={vc.chunk_id} vc={vc} index={vi} />
                ))}
              </div>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Lexical Analysis Panel ──────────────────────────────────────────────────

function LexicalAnalysisPanel({ analysis }: { analysis: QueryLexicalEngineAnalysisInterface }) {
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
              <AlignLeft size={10} />
              Tokens
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
              <Tag size={10} />
              Entities
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

        {analysis.noun_chunks.length > 0 && (
          <div className="px-4 py-3 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              Noun Chunks
            </p>

            <div className="flex flex-wrap gap-1.5">
              {analysis.noun_chunks.map((nc, i) => (
                <span
                  key={i}
                  className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded break-words"
                >
                  {nc}
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
            ).map(([label, val]) => (
              <span
                key={label}
                className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
                  val
                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {label}: {val ? "Yes" : "No"}
              </span>
            ))}
          </div>
        </div>

        {analysis.lane_priority.length > 0 && (
          <div className="px-4 py-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1">
              <SlidersHorizontal size={10} />
              Lane Priority
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
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600 dark:from-violet-500 dark:to-violet-400"
                      style={{
                        width: `${maxP > 0 ? (priority / maxP) * 100 : 0}%`,
                      }}
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

interface QueryIndexProps {
  doc_id?: string | null;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function QueryIndex({ doc_id: propDocId }: QueryIndexProps) {
  const { org_id, project_id } = useParams<{
    org_id: string;
    project_id: string;
  }>();

  const doc_id = propDocId || null;
  const navigate = useNavigate();

  // Zustand Store
  const { query, isLoading, isStreaming, streamedAnswer, streamedThinking, toolSteps } =
    useQueryStore();

  // Local UI State
  const [inputQuery, setInputQuery] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);

  // Query Settings
  const [queryType, setQueryType] = useState<QueryType>(QueryType.SMART);

  const [queryDepth, setQueryDepth] = useState<QueryDepth>(QueryDepth.STANDARD);

  const [topK, setTopK] = useState<number>(5);

  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputQuery.trim() || !org_id || !project_id) {
      return;
    }

    setResponse(null);

    const data = await query({
      org_id,
      project_id,
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

  const handleBack = () => {
    navigate(`/organizations/${org_id}/projects/${project_id}?tab=documents`);
  };

  const isExpert = queryType === QueryType.EXPERT;
  const isFetching = isLoading || isStreaming;

  // Coalesce standard and streaming results
  const displayAnswer = isThinkingMode ? streamedAnswer || response?.answer : response?.answer;

  const hasLexicalChunks = !!response?.lexical_engine_chunk_ids?.length;

  const hasLexicalAnalysis = !!response?.lexical_engine_analysis;

  const hasMetadata = response?.metadata && response.metadata.length > 0;

  // The answer is "live" once real answer tokens have started arriving during
  // a stream — distinct from the reasoning/tool phase, where streamedAnswer
  // is still empty.
  const isAnswerLive = isStreaming && isThinkingMode && !!streamedAnswer;
  const hasReasoning = isThinkingMode && (toolSteps.length > 0 || !!streamedThinking);

  return (
    <div className="space-y-6 w-full py-2 md:py-3 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* ── Header ── */}

      <button
        type="button"
        onClick={handleBack}
        className="mb-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium cursor-pointer text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to Documents
      </button>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Document Query Engine
          </h1>

          {doc_id && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Querying Doc ID:{" "}
              <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                {doc_id}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Type */}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              Type
            </label>

            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value as QueryType)}
              className="px-3 py-2 h-9 text-sm rounded-lg cursor-pointer border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value={QueryType.QUICK}>Quick</option>

              <option value={QueryType.SMART}>Smart</option>

              <option value={QueryType.EXPERT}>Expert</option>
            </select>
          </div>

          {/* Depth */}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              Depth
            </label>

            <select
              value={queryDepth}
              onChange={(e) => setQueryDepth(e.target.value as QueryDepth)}
              className="px-3 py-2 h-9 text-sm rounded-lg cursor-pointer border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value={QueryDepth.STANDARD}>Standard</option>

              <option value={QueryDepth.ADVANCED}>Advanced</option>
            </select>
          </div>

          {/* Top K */}

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

          {/* Thinking Toggle */}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase  tracking-wider font-semibold text-zinc-400">
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
              <BrainCircuit size={16} />
              Thinking
            </button>
          </div>
        </div>
      </div>

      {/* Expert mode banner */}

      {isExpert && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-xs text-violet-700 dark:text-violet-300">
          <FlaskConical size={13} />

          <strong>Expert mode</strong>

          <span>— Lexical engine analysis will be included in results.</span>
        </div>
      )}

      {/* ── Search bar ── */}

      <form onSubmit={handleSearch} className="relative w-full">
        <input
          type="text"
          placeholder="Ask a question...."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isFetching}
          className="w-full pl-4 pr-12 py-3.5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder-zinc-400 dark:placeholder-zinc-500 transition"
        />

        <button
          type="submit"
          disabled={isFetching || !inputQuery.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 hover:opacity-90 transition"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4 cursor-pointer" />
          )}
        </button>
      </form>

      {/* ── Response Section ── */}

      {(response || isStreaming || displayAnswer || toolSteps.length > 0) && (
        <div className="grid lg:grid-cols-3 gap-6 items-start w-full">
          {/* LEFT/CENTER */}

          <div className="lg:col-span-2 space-y-5 w-full">
            {/* Thinking / Streaming Steps */}

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
                    // Open by default while reasoning is still in progress
                    // (i.e. before real answer tokens start), collapsed once
                    // the final answer takes over, so it doesn't compete for
                    // attention.
                    defaultOpen={isStreaming && !streamedAnswer}
                  >
                    <p className="text-sm italic text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line break-words w-full">
                      {streamedThinking}
                    </p>
                  </Collapsible>
                )}

                {/* ── Separator: marks the transition from reasoning to the
                    final answer below. ── */}
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-zinc-200 dark:to-zinc-800" />
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 whitespace-nowrap">
                    <ArrowDown size={11} />
                    Final Answer
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-zinc-200 dark:via-zinc-800 to-zinc-200 dark:to-zinc-800" />
                </div>
              </div>
            )}

            {/* ── Answer Display ── */}

            <div className="p-5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <HelpCircle size={14} />
                  Answer Engine
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
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mt-4 mb-3">{children}</h1>
                      ),

                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold mt-4 mb-3">{children}</h2>
                      ),

                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
                      ),

                      p: ({ children }) => <p className="mb-3 leading-7">{children}</p>,

                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
                      ),

                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
                      ),

                      li: ({ children }) => <li className="leading-6">{children}</li>,

                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),

                      table: ({ children }) => (
                        <div className="overflow-x-auto w-full mb-4">
                          <table className="min-w-full border-collapse border border-zinc-200 dark:border-zinc-700 text-sm">
                            {children}
                          </table>
                        </div>
                      ),

                      th: ({ children }) => (
                        <th className="border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-left font-semibold">
                          {children}
                        </th>
                      ),

                      td: ({ children }) => (
                        <td className="border border-zinc-200 dark:border-zinc-700 px-3 py-2 align-top">
                          {children}
                        </td>
                      ),

                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 my-3 text-zinc-600 dark:text-zinc-400">
                          {children}
                        </blockquote>
                      ),

                      code: ({ children }) => (
                        <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {displayAnswer}
                  </ReactMarkdown>
                ) : isStreaming ? (
                  <span className="animate-pulse text-zinc-400">
                    {hasReasoning ? "Finalizing answer…" : "Agent is processing..."}
                  </span>
                ) : (
                  <span className="italic text-zinc-400">No answer generated.</span>
                )}
              </div>
            </div>

            {/* ── Grounded Sources ── */}

            {hasMetadata && (
              <div className="mt-10 w-full">
                <Collapsible
                  label="Grounded Sources"
                  icon={<Layers size={15} />}
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

          {/* RIGHT: Lexical Panels */}

          <div className="space-y-4 w-full overflow-hidden">
            {/* Lexical analysis */}

            {hasLexicalAnalysis && (
              <LexicalAnalysisPanel analysis={response!.lexical_engine_analysis!} />
            )}

            {/* Lexical chunk scores */}

            {hasLexicalChunks && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden w-full">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 flex items-center gap-2">
                  <Search size={13} className="text-zinc-400" />

                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Lexical Chunk Scores
                  </h3>

                  <span className="ml-auto bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                    {response!.lexical_engine_chunk_ids!.length}
                  </span>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 w-full">
                  {response!.lexical_engine_chunk_ids!.map((lex, index) => {
                    const maxScore = Math.max(
                      ...response!.lexical_engine_chunk_ids!.map((l) => l.score ?? 0),
                    );

                    const lexScore = lex.score ?? 0;

                    const pct = maxScore > 0 ? (lexScore / maxScore) * 100 : 0;

                    return (
                      <div key={index} className="px-4 py-3 space-y-1.5 w-full">
                        <div className="flex items-start justify-between gap-2 text-xs">
                          <span className="font-mono text-zinc-500 dark:text-zinc-400 break-all text-[11px] leading-relaxed w-full">
                            {lex.chunk_id}
                          </span>

                          <span className="flex-shrink-0 font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
                            {lexScore.toFixed(4)}
                          </span>
                        </div>

                        <div className="h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden w-full">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-400 transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-[10px] text-zinc-400 w-full">
                  <BarChart2 size={11} />
                  Avg score:
                  <strong className="text-zinc-600 dark:text-zinc-300">
                    {(
                      response!.lexical_engine_chunk_ids!.reduce((a, l) => a + (l.score ?? 0), 0) /
                      response!.lexical_engine_chunk_ids!.length
                    ).toFixed(4)}
                  </strong>
                </div>
              </div>
            )}

            {/* No lexical */}

            {!hasLexicalChunks && !hasLexicalAnalysis && response && !isExpert && (
              <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-6 text-center space-y-2 w-full">
                <Zap size={20} className="mx-auto text-zinc-300 dark:text-zinc-700" />

                <p className="text-xs text-zinc-400">
                  Lexical engine data is only available in <strong>Expert</strong> mode.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
