import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Loader2, Database, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useChunkStore } from "@/store/chunkStore";
import { ChunkCard } from "./ChunkCard";

export default function Chunks() {
  const { org_id, project_id, doc_id } = useParams<{
    org_id: string;
    project_id: string;
    doc_id: string;
  }>();

  const { chunks, pagination, isLoading, fetchChunks } = useChunkStore();

  // Local state for pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (org_id && project_id && doc_id) {
      fetchChunks(org_id, project_id, doc_id, page, limit);
    }
  }, [org_id, project_id, doc_id, page, limit, fetchChunks]);

  const handleNextPage = () => {
    if (pagination && page < pagination.total_pages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/organizations/${org_id}/projects/${project_id}?tab=documents`);
  };

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black p-3">
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium cursor-pointer text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Back to Documents
      </button>

      <div className="max-w-[95%] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Document Chunks
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage and edit parsed chunks for this document.
            </p>
          </div>

          <button
            onClick={() => alert("Add chunk feature coming soon!")}
            className="inline-flex items-center gap-2 px-4 py-2 cursor-pointer bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Chunk
          </button>
        </div>

        {/* Content State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p className="text-sm">Loading chunks...</p>
          </div>
        ) : chunks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <Database className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-sm font-medium text-black dark:text-white">No chunks found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              This document hasn't been chunked yet or the parser returned no text.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chunks.map((chunk) => (
              <ChunkCard key={chunk.id || chunk.chunk_id} chunk={chunk} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing page {pagination.current_page} of {pagination.total_pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={page >= pagination.total_pages}
                className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
