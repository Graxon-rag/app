import React, { useState } from "react";
import { Hash, ChevronUp, ChevronDown, ArrowLeft, ArrowRight, GitBranch } from "lucide-react";
import { QueryMetadataInterface } from "@/interfaces/QueryInterface";
import { Collapsible } from "./Collapsible";

function AdjacentChunkPanel({
  label,
  icon,
  accentColor,
  chunk,
}: {
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  chunk: { chunk_id: string; text: string; chunk_number: number; weight: number };
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden w-full">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-xs cursor-pointer"
      >
        <span className={`flex items-center gap-1.5 font-semibold ${accentColor}`}>
          {icon}
          {label}
          <span className="font-mono text-zinc-400 dark:text-zinc-500 font-normal">
            — Chunk {chunk.chunk_number}
          </span>
        </span>
        <span className="text-zinc-400">
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

function VecSimilarChunkItem({
  vc,
  index,
}: {
  vc: { chunk_id: string; text: string; chunk_number: number; weight: number };
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden w-full">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-50/80 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/65 transition text-xs cursor-pointer"
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

interface ChunkCardProps {
  chunk: QueryMetadataInterface;
  index: number;
}

export function ChunkCard({ chunk }: ChunkCardProps) {
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
                  <ChevronUp size={11} /> Collapse
                </>
              ) : (
                <>
                  <ChevronDown size={11} /> Details{" "}
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
