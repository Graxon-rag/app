import React, { useEffect, useState, useMemo } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Check,
  Copy,
  MoreVertical,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileJson,
  FileCode,
  FileAudio,
  FileVideo,
  Image as ImageIcon,
  File,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ArrowUpDown,
  FilterX,
  Loader2,
} from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";
import { DocumentInterface } from "@/interfaces/DocumentInterface";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PLAIN_TEXT_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  SPREADSHEET_EXTENSIONS,
  PRESENTATION_EXTENSIONS,
  STRUCTURED_DATA_EXTENSIONS,
  MARKUP_EXTENSIONS,
  CODE_EXTENSIONS,
  IMAGE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from "@/libs/documentTypes";
import toast from "react-hot-toast";

const EXTENSION_CATEGORIES: Record<string, { label: string; extensions: string[] }> = {
  document: { label: "Documents", extensions: DOCUMENT_EXTENSIONS },
  spreadsheet: { label: "Spreadsheets", extensions: SPREADSHEET_EXTENSIONS },
  presentation: { label: "Presentations", extensions: PRESENTATION_EXTENSIONS },
  text: { label: "Plain Text", extensions: PLAIN_TEXT_EXTENSIONS },
  code: { label: "Code & Scripts", extensions: CODE_EXTENSIONS },
  markup: { label: "Markup (HTML)", extensions: MARKUP_EXTENSIONS },
  structured: { label: "Structured (JSON/YAML)", extensions: STRUCTURED_DATA_EXTENSIONS },
  image: { label: "Images", extensions: IMAGE_EXTENSIONS },
  audio: { label: "Audio", extensions: AUDIO_EXTENSIONS },
  video: { label: "Video", extensions: VIDEO_EXTENSIONS },
};

const getFileIcon = (filename: string) => {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (DOCUMENT_EXTENSIONS.includes(ext)) {
    return <FileText size={16} className={ext === ".pdf" ? "text-red-500" : "text-blue-500"} />;
  }
  if (PLAIN_TEXT_EXTENSIONS.includes(ext)) return <FileText size={16} className="text-zinc-400" />;
  if (SPREADSHEET_EXTENSIONS.includes(ext))
    return <FileSpreadsheet size={16} className="text-green-500" />;
  if (PRESENTATION_EXTENSIONS.includes(ext))
    return <Presentation size={16} className="text-orange-500" />;
  if (STRUCTURED_DATA_EXTENSIONS.includes(ext))
    return <FileJson size={16} className="text-yellow-500" />;
  if (CODE_EXTENSIONS.includes(ext) || MARKUP_EXTENSIONS.includes(ext))
    return <FileCode size={16} className="text-purple-500" />;
  if (IMAGE_EXTENSIONS.includes(ext)) return <ImageIcon size={16} className="text-emerald-500" />;
  if (AUDIO_EXTENSIONS.includes(ext)) return <FileAudio size={16} className="text-pink-500" />;
  if (VIDEO_EXTENSIONS.includes(ext)) return <FileVideo size={16} className="text-indigo-500" />;
  return <File size={16} className="text-zinc-400" />;
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        badge:
          "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700",
        dot: "bg-zinc-400",
        label: "Pending",
      };
    case "QUEUED":
      return {
        badge:
          "bg-yellow-50 text-yellow-700 border-yellow-200/60 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-600/60",
        dot: "bg-yellow-500",
        label: "Queued",
      };
    case "PROCESSING":
      return {
        badge:
          "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
        dot: "bg-blue-500 animate-pulse",
        label: "Processing",
      };
    case "PROCESSED":
      return {
        badge:
          "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
        dot: "bg-emerald-500",
        label: "Processed",
      };
    case "FAILED":
      return {
        badge:
          "bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60",
        dot: "bg-red-500",
        label: "Failed",
      };
    default:
      return {
        badge:
          "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
        dot: "bg-zinc-400",
        label: status,
      };
  }
};

function DocumentTable({ orgId, projectId }: { orgId: string; projectId: string }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL search query parameters
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const statusFilter = searchParams.get("status") || "";
  const nameFilter = searchParams.get("name") || "";
  const categoryFilter = searchParams.get("category") || "";
  const typeFilter = searchParams.get("type") || "";
  const sizeOpFilter = (searchParams.get("size_op") as ">" | "<" | "=") || ">";
  const sizeMbFilter = searchParams.get("size_mb") || "";
  const sortBy =
    (searchParams.get("sort_by") as "created_at" | "updated_at" | "name" | "size") || "created_at";
  const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || "desc";

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState(nameFilter);

  const { documents, pagination, getAllDocuments, deleteDocument, submitForProcessDocument } =
    useDocumentStore();

  // Fetch documents on parameter changes
  useEffect(() => {
    const sizeInBytes = sizeMbFilter
      ? Math.round(parseFloat(sizeMbFilter) * 1024 * 1024)
      : undefined;
    const types =
      categoryFilter && !typeFilter ? EXTENSION_CATEGORIES[categoryFilter]?.extensions : undefined;

    getAllDocuments(orgId, projectId, {
      page,
      limit,
      status: statusFilter || undefined,
      name: nameFilter || undefined,
      type: typeFilter || undefined,
      types,
      size: sizeInBytes,
      size_op: sizeMbFilter ? sizeOpFilter : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
  }, [
    orgId,
    projectId,
    page,
    limit,
    statusFilter,
    nameFilter,
    categoryFilter,
    typeFilter,
    sizeOpFilter,
    sizeMbFilter,
    sortBy,
    sortOrder,
  ]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (!val) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    if (!updates.page && updates.page !== null) {
      next.set("page", "1"); // Reset to page 1 on filter changes
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams({ page: "1", limit: limit.toString(), tab: "documents" }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const sizeInBytes = sizeMbFilter
        ? Math.round(parseFloat(sizeMbFilter) * 1024 * 1024)
        : undefined;
      const types =
        categoryFilter && !typeFilter
          ? EXTENSION_CATEGORIES[categoryFilter]?.extensions
          : undefined;
      await getAllDocuments(orgId, projectId, {
        page,
        limit,
        status: statusFilter || undefined,
        name: nameFilter || undefined,
        type: typeFilter || undefined,
        types,
        size: sizeInBytes,
        size_op: sizeMbFilter ? sizeOpFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const availableExtensions = useMemo(() => {
    return categoryFilter ? EXTENSION_CATEGORIES[categoryFilter]?.extensions || [] : [];
  }, [categoryFilter]);

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return "Null";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1000);
  };

  const totalPages = pagination?.total_pages || 1;
  const currentPage = pagination?.current_page || page;
  const hasActiveFilters = Boolean(
    statusFilter ||
    nameFilter ||
    categoryFilter ||
    typeFilter ||
    sizeMbFilter ||
    sortBy !== "created_at" ||
    sortOrder !== "desc",
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleProcess = async (doc: DocumentInterface) => {
    try {
      const sizeInBytes = sizeMbFilter
        ? Math.round(parseFloat(sizeMbFilter) * 1024 * 1024)
        : undefined;
      const types =
        categoryFilter && !typeFilter
          ? EXTENSION_CATEGORIES[categoryFilter]?.extensions
          : undefined;

      const response = await submitForProcessDocument(orgId, projectId, doc.id, {
        page,
        limit,
        status: statusFilter || undefined,
        name: nameFilter || undefined,
        type: typeFilter || undefined,
        types,
        size: sizeInBytes,
        size_op: sizeMbFilter ? sizeOpFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      if (response === false) return;
      await handleRefresh();
      toast.success("Submitted for processing"); // use a toast, not alert()
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit for processing");
    }
  };

  const handleDelete = async (id: string) => {
    const sizeInBytes = sizeMbFilter
      ? Math.round(parseFloat(sizeMbFilter) * 1024 * 1024)
      : undefined;
    const types =
      categoryFilter && !typeFilter ? EXTENSION_CATEGORIES[categoryFilter]?.extensions : undefined;
    await deleteDocument(orgId, projectId, id, {
      page,
      limit,
      status: statusFilter || undefined,
      name: nameFilter || undefined,
      type: typeFilter || undefined,
      types,
      size: sizeInBytes,
      size_op: sizeMbFilter ? sizeOpFilter : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
  };

  return (
    <div className="space-y-3 mb-10 text-zinc-900 dark:text-zinc-100">
      {/* 1. FILTER CONTROLS TOOLBAR */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Name Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search filename..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateFilters({ name: searchInput })}
              onBlur={() => updateFilters({ name: searchInput })}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 cursor-pointer border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-zinc-400"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="QUEUED">Queued</option>
            <option value="PROCESSING">Processing</option>
            <option value="PROCESSED">Processed</option>
            <option value="FAILED">Failed</option>
          </select>

          {/* Type Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => updateFilters({ category: e.target.value, type: null })}
            className="px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 border cursor-pointer border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-zinc-400"
          >
            <option value="">All File Types</option>
            {Object.entries(EXTENSION_CATEGORIES).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </select>

          {/* Specific Extension Dropdown (Dependent on Category) */}
          <select
            value={typeFilter}
            disabled={!categoryFilter}
            onChange={(e) => updateFilters({ type: e.target.value })}
            className="px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-40"
          >
            <option value="">All Extensions</option>
            {availableExtensions.map((ext) => (
              <option key={ext} value={ext.replace(".", "")}>
                {ext}
              </option>
            ))}
          </select>

          {/* Size Filter (<, >, = MB) */}
          <div className="flex items-center gap-1">
            <select
              value={sizeOpFilter}
              onChange={(e) => updateFilters({ size_op: e.target.value })}
              className="w-12 px-1 py-1.5 text-xs bg-white cursor-pointer dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
            >
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value="=">=</option>
            </select>
            <input
              type="number"
              step="0.1"
              placeholder="Size (MB)"
              value={sizeMbFilter}
              onChange={(e) => updateFilters({ size_mb: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Sort By & Order */}
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => updateFilters({ sort_by: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 cursor-pointer border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Updated Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
            <button
              onClick={() => updateFilters({ sort_order: sortOrder === "asc" ? "desc" : "asc" })}
              className="p-1.5 border border-zinc-200 cursor-pointer dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700"
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
            >
              <ArrowUpDown size={14} className={sortOrder === "asc" ? "text-blue-500" : ""} />
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-end pt-1">
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 cursor-pointer text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              <FilterX size={13} /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 2. TOP ACTIONS & PAGINATION BAR */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Documents</span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh documents"
            className={`p-1.5 rounded-md border cursor-pointer transition-all duration-300 ${
              isRefreshing
                ? "border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)] dark:shadow-[0_0_15px_rgba(96,165,250,0.4)]"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:shadow-[0_0_10px_rgba(255,255,255,0.15)]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw
              size={14}
              className={`${
                isRefreshing
                  ? "animate-spin text-blue-500 dark:text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]"
                  : ""
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Rows:</span>
            <select
              value={limit}
              onChange={(e) => updateFilters({ limit: e.target.value, page: "1" })}
              className="bg-transparent border cursor-pointer border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-700 dark:text-zinc-300"
            >
              <option value={10} className="dark:bg-zinc-900">
                10
              </option>
              <option value={20} className="dark:bg-zinc-900">
                20
              </option>
              <option value={50} className="dark:bg-zinc-900">
                50
              </option>
              <option value={100} className="dark:bg-zinc-900">
                100
              </option>
            </select>
          </div>

          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Page{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentPage}</span> of{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => updateFilters({ page: (currentPage - 1).toString() })}
              disabled={currentPage <= 1 || isRefreshing}
              className="p-1 rounded-md border border-zinc-200 cursor-pointer dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
              disabled={currentPage >= totalPages || isRefreshing}
              className="p-1 rounded-md border border-zinc-200 cursor-pointer dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. DOCUMENTS TABLE */}
      <div className="rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Size</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Created At</th>
              <th className="text-left p-3">Updated At</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc: DocumentInterface) => (
              <tr
                key={doc.id}
                className="border-t dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <td className="p-3 font-mono text-xs">
                  <button
                    onClick={() => handleCopyId(doc.id)}
                    className="flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    title="Copy ID"
                  >
                    {doc.id.substring(0, 8)}...
                    {copiedId === doc.id ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </td>

                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/organizations/${orgId}/projects/${projectId}/docs/${doc.id}/view`,
                        )
                      }
                      className=" cursor-pointer"
                    >
                      {getFileIcon(doc.name)}
                    </button>
                    <span title={doc.name}>
                      {doc.name.length > 20 ? `${doc.name.slice(0, 20)}...` : doc.name}
                    </span>
                    {doc.is_ocr_needed && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        OCR
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-3">{doc.type}</td>
                <td className="p-3 text-zinc-500">{formatBytes(doc.size)}</td>

                <td className="p-3">
                  {(() => {
                    const style = getStatusStyles(doc.status);
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                    );
                  })()}
                </td>

                <td className="p-3 text-zinc-500">{new Date(doc.created_at).toLocaleString()}</td>
                <td className="p-3 text-zinc-500">{new Date(doc.updated_at).toLocaleString()}</td>

                <td className="p-3 text-right ">
                  <DropdownMenu.Root
                    open={openMenuId === doc.id}
                    onOpenChange={(open) => setOpenMenuId(open ? doc.id : null)}
                  >
                    <DropdownMenu.Trigger asChild>
                      <button className="p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content
                      align="end"
                      className="z-50 min-w-[160px] rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-md p-1"
                    >
                      <DropdownMenu.Item
                        onClick={() =>
                          navigate(
                            `/organizations/${orgId}/projects/${projectId}/docs/${doc.id}/view`,
                          )
                        }
                        className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
                      >
                        View
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                      <DropdownMenu.Item
                        onSelect={(e) => {
                          if (
                            doc.status === "PROCESSING" ||
                            doc.status === "QUEUED" ||
                            doc.status === "PROCESSED"
                          )
                            return;
                          e.preventDefault();
                          setOpenMenuId(null);
                          handleProcess(doc);
                        }}
                        disabled={
                          doc.status === "PROCESSING" ||
                          doc.status === "QUEUED" ||
                          doc.status === "PROCESSED"
                        }
                        className="flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent data-[disabled]:pointer-events-none"
                      >
                        {(doc.status === "PROCESSING" || doc.status === "QUEUED") && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {doc.status === "PROCESSING" || doc.status === "QUEUED"
                          ? "Processing…"
                          : doc.status === "PROCESSED"
                            ? "Processed"
                            : doc.status === "FAILED"
                              ? "Retry Processing"
                              : "Process"}
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                      <DropdownMenu.Item
                        onClick={() =>
                          navigate(
                            `/organizations/${orgId}/projects/${projectId}/docs/${doc.id}/chunks`,
                          )
                        }
                        className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
                      >
                        Chunks
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                      <DropdownMenu.Item
                        onClick={() =>
                          navigate(
                            `/organizations/${orgId}/projects/${projectId}/docs/${doc.id}/query`,
                          )
                        }
                        disabled={doc.status !== "PROCESSED"}
                        className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent data-[disabled]:pointer-events-none"
                      >
                        Query
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                      <DropdownMenu.Item
                        onClick={() =>
                          window.open(
                            `${import.meta.env.VITE_MINIO_URL}/browser/${doc.bucket}/${doc.key}`,
                            "_blank",
                          )
                        }
                        className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
                      >
                        Open in Object Store
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                      <DropdownMenu.Item
                        onClick={async () => {
                          if (!confirm("Delete this document?")) return;
                          await handleDelete(doc.id);
                          // await handleRefresh();
                        }}
                        className="px-3 py-2 text-left text-sm rounded-md cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 outline-none"
                      >
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </td>
              </tr>
            ))}

            {documents.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-6 text-zinc-500">
                  No documents found matching filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DocumentTable;
