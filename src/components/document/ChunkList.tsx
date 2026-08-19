import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Plus,
  Loader2,
  Database,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  X,
  TriangleAlert,
  Search,
} from "lucide-react";
import { useChunkStore } from "@/store/chunkStore";
import { ChunkCard } from "./ChunkCard";
import { ChunkCreateInterface } from "@/interfaces/ChunkInterface";

export default function Chunks() {
  const { org_id, project_id, doc_id } = useParams<{
    org_id: string;
    project_id: string;
    doc_id: string;
  }>();

  const navigate = useNavigate();
  const { chunks, pagination, isLoading, fetchChunks } = useChunkStore();

  // --- URL Search Params State ---
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  // Sorting params
  const sortBy = searchParams.get("sort_by") || "chunk_number";
  const sortOrder = searchParams.get("sort_order") || "asc";

  // Determine active search type from URL
  const urlSearch = searchParams.get("search") || "";
  const urlChunkNum = searchParams.get("chunk_number") || "";
  const urlChunkId = searchParams.get("chunk_id") || "";
  const urlUuid = searchParams.get("id") || "";

  const initialSearchType = urlChunkNum
    ? "chunk_number"
    : urlChunkId
      ? "chunk_id"
      : urlUuid
        ? "id"
        : "search";
  const initialSearchValue = urlChunkNum || urlChunkId || urlUuid || urlSearch;

  // Local state for the search input
  const [searchType, setSearchType] = useState(initialSearchType);
  const [searchInput, setSearchInput] = useState(initialSearchValue);

  // Inline debounce: Sync search input to URL with a slight delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams((prev) => {
        // 1. Check what is currently in the URL
        const activeSearchInUrl = prev.get(searchType) || "";

        // 2. Check if there are any old search categories stuck in the URL
        const hasStrayParams =
          (searchType !== "search" && prev.has("search")) ||
          (searchType !== "chunk_number" && prev.has("chunk_number")) ||
          (searchType !== "chunk_id" && prev.has("chunk_id")) ||
          (searchType !== "id" && prev.has("id"));

        // 3. IF the user hasn't typed anything new AND there are no old params to clean up, DO NOTHING.
        if (searchInput === activeSearchInUrl && !hasStrayParams) {
          return prev;
        }

        // 4. OTHERWISE, apply the new search and safely reset to Page 1
        prev.delete("search");
        prev.delete("chunk_number");
        prev.delete("chunk_id");
        prev.delete("id");

        if (searchInput) {
          prev.set(searchType, searchInput);
        }

        prev.set("page", "1"); // Only reset to page 1 when an ACTUAL new search occurs
        return prev;
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, searchType, setSearchParams]);

  // Fetch data whenever URL params change
  useEffect(() => {
    if (org_id && project_id && doc_id) {
      fetchChunks(
        org_id,
        project_id,
        doc_id,
        page,
        limit,
        searchParams.get("search") || undefined,
        searchParams.get("chunk_number") ? Number(searchParams.get("chunk_number")) : undefined,
        searchParams.get("chunk_id") || undefined,
        searchParams.get("id") || undefined,
        sortBy,
        sortOrder,
      );
    }
  }, [org_id, project_id, doc_id, page, limit, searchParams, sortBy, sortOrder, fetchChunks]);

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams((prev) => {
      prev.set("limit", e.target.value);
      prev.set("page", "1");
      return prev;
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split("-");
    setSearchParams((prev) => {
      prev.set("sort_by", newSortBy);
      prev.set("sort_order", newSortOrder);
      prev.set("page", "1");
      return prev;
    });
  };

  const handleSearchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(e.target.value);
    setSearchInput("");
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.total_pages) {
      setSearchParams((prev) => {
        prev.set("page", (page + 1).toString());
        return prev;
      });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setSearchParams((prev) => {
        prev.set("page", (page - 1).toString());
        return prev;
      });
    }
  };

  const handleBack = () => {
    navigate(`/organizations/${org_id}/projects/${project_id}?tab=documents`);
  };

  // --- Add Chunk Modal State & Handlers ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addText, setAddText] = useState("");
  const [addFileChunkNumber, setAddFileChunkNumber] = useState(0);
  const [addMetadataStr, setAddMetadataStr] = useState("{\n  \n}");
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [addError, setAddError] = useState("");

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setShowAddConfirm(false);
    setAddError("");
    setAddText("");
    setAddFileChunkNumber(0);
    setAddMetadataStr("{\n  \n}");
  };

  const handleAddInitiateSave = () => {
    setAddError("");
    if (!addText.trim()) {
      setAddError("Chunk text is required.");
      return;
    }
    if (addMetadataStr.trim() && addMetadataStr.trim() !== "{}") {
      try {
        JSON.parse(addMetadataStr);
      } catch (err) {
        setAddError("Invalid JSON format in metadata.");
        return;
      }
    }
    setShowAddConfirm(true);
  };

  const handleAddConfirmSave = () => {
    let parsedMetadata = undefined;
    if (addMetadataStr.trim() && addMetadataStr.trim() !== "{}") {
      parsedMetadata = JSON.parse(addMetadataStr);
    }
    const payload: ChunkCreateInterface = {
      text: addText,
      file_chunk_number: addFileChunkNumber,
      metadata: parsedMetadata,
    };
    console.log("Mock Add Chunk Payload:", payload);
    alert("Chunk logged to console successfully!");
    handleCloseAddModal();
  };

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black p-3 relative">
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium cursor-pointer text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Back to Documents
      </button>

      <div className="max-w-[95%] mx-auto space-y-4">
        {/* Header Title */}
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-500" />
            Document Chunks
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage, search, and edit parsed chunks for this document.
          </p>
        </div>

        {/* --- Top Toolbar: Filters, Pagination, Actions --- */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
          {/* Left: Expanded Search */}
          <div className="w-full xl:max-w-lg flex-1">
            <div className="flex items-center gap-0 w-full rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-shadow">
              <select
                value={searchType}
                onChange={handleSearchTypeChange}
                className="h-9 pl-3 pr-1 rounded-l-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 border-none outline-none cursor-pointer"
              >
                <option
                  value="search"
                  className="bg-white dark:bg-zinc-800 text-black dark:text-white"
                >
                  Text
                </option>
                <option
                  value="chunk_number"
                  className="bg-white dark:bg-zinc-800 text-black dark:text-white"
                >
                  Chunk #
                </option>
                <option
                  value="chunk_id"
                  className="bg-white dark:bg-zinc-800 text-black dark:text-white"
                >
                  Chunk ID
                </option>
                <option value="id" className="bg-white dark:bg-zinc-800 text-black dark:text-white">
                  UUID
                </option>
              </select>

              <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700"></div>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={searchType === "chunk_number" ? "number" : "text"}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={`Search by ${searchType.replace("_", " ")}...`}
                  className="w-full h-9 pl-9 pr-3 rounded-r-lg bg-transparent text-sm text-black dark:text-white border-none outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right: Sort, Limit, Pagination & Add */}
          <div className="flex flex-wrap items-center gap-4 xl:gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Sort:</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={handleSortChange}
                className="h-9 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-black dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option
                  value="chunk_number-asc"
                  className="bg-white dark:bg-zinc-800 text-black dark:text-white"
                >
                  Sequential
                </option>
                <option
                  value="chunk_number-desc"
                  className="bg-white dark:bg-zinc-800 text-black dark:text-white"
                >
                  Reverse
                </option>
                <option
                  value="created_at-desc"
                  className="bg-white dark:bg-zinc-800 text-black dark:text-white"
                >
                  Newest First
                </option>
                <option
                  value="created_at-asc"
                  className="bg-white dark:bg-zinc-800 text-black dark:text-white"
                >
                  Oldest First
                </option>
              </select>
            </div>

            {/* Limit Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Limit:</label>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="h-9 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-black dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="5" className="bg-white dark:bg-zinc-800 text-black dark:text-white">
                  5
                </option>
                <option value="10" className="bg-white dark:bg-zinc-800 text-black dark:text-white">
                  10
                </option>
                <option value="20" className="bg-white dark:bg-zinc-800 text-black dark:text-white">
                  20
                </option>
                <option value="30" className="bg-white dark:bg-zinc-800 text-black dark:text-white">
                  30
                </option>
                <option value="50" className="bg-white dark:bg-zinc-800 text-black dark:text-white">
                  50
                </option>
              </select>
            </div>

            <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800"></div>

            {/* Pagination Controls */}
            {pagination && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  Page {pagination.current_page} of {pagination.total_pages || 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page >= (pagination.total_pages || 1)}
                    className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800"></div>

            {/* Add Chunk Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 cursor-pointer bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Chunk
            </button>
          </div>
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
              Try adjusting your filters or add a new chunk manually.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            {chunks.map((chunk) => (
              <ChunkCard key={chunk.id || chunk.chunk_id} chunk={chunk} />
            ))}
          </div>
        )}
      </div>

      {/* --- Add Chunk Modal --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <h2 className="text-lg font-semibold text-black dark:text-white">Add Manual Chunk</h2>
              <button
                onClick={handleCloseAddModal}
                disabled={showAddConfirm}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white rounded-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {addError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  File Chunk Number
                </label>
                <input
                  type="number"
                  disabled={showAddConfirm}
                  value={addFileChunkNumber}
                  onChange={(e) => setAddFileChunkNumber(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm text-black dark:text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Chunk Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  disabled={showAddConfirm}
                  placeholder="Enter the raw text content..."
                  className="w-full min-h-[150px] p-3 text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500 disabled:opacity-50 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Metadata (JSON format)
                </label>
                <textarea
                  value={addMetadataStr}
                  onChange={(e) => setAddMetadataStr(e.target.value)}
                  disabled={showAddConfirm}
                  className="w-full h-24 p-3 font-mono text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500 disabled:opacity-50 resize-y"
                />
              </div>
            </div>

            <div className="p-5 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl">
              {showAddConfirm ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-400">
                    <TriangleAlert className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-medium leading-snug">
                      Confirm creation? This will be injected directly into the document.
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => setShowAddConfirm(false)}
                      className="px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-md transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddConfirmSave}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-md transition-colors shadow-sm cursor-pointer"
                    >
                      Yes, create
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCloseAddModal}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddInitiateSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Save Chunk
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
