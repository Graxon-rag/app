import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";
import { DocumentInterface } from "@/interfaces/DocumentInterface";

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
import { useNavigate, useSearchParams } from "react-router-dom";

const getFileIcon = (filename: string) => {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();

  if (DOCUMENT_EXTENSIONS.includes(ext)) {
    const isPdf = ext === ".pdf";
    return <FileText size={16} className={isPdf ? "text-red-500" : "text-blue-500"} />;
  }
  if (PLAIN_TEXT_EXTENSIONS.includes(ext)) {
    return <FileText size={16} className="text-zinc-400" />;
  }
  if (SPREADSHEET_EXTENSIONS.includes(ext)) {
    return <FileSpreadsheet size={16} className="text-green-500" />;
  }
  if (PRESENTATION_EXTENSIONS.includes(ext)) {
    return <Presentation size={16} className="text-orange-500" />;
  }
  if (STRUCTURED_DATA_EXTENSIONS.includes(ext)) {
    return <FileJson size={16} className="text-yellow-500" />;
  }
  if (CODE_EXTENSIONS.includes(ext) || MARKUP_EXTENSIONS.includes(ext)) {
    return <FileCode size={16} className="text-purple-500" />;
  }
  if (IMAGE_EXTENSIONS.includes(ext)) {
    return <ImageIcon size={16} className="text-emerald-500" />;
  }
  if (AUDIO_EXTENSIONS.includes(ext)) {
    return <FileAudio size={16} className="text-pink-500" />;
  }
  if (VIDEO_EXTENSIONS.includes(ext)) {
    return <FileVideo size={16} className="text-indigo-500" />;
  }

  return <File size={16} className="text-zinc-400" />;
};

const getProcessActionLabel = (status: string) => {
  switch (status) {
    case "FAILED":
      return "Retry Processing";
    case "PROCESSED":
      return "Reprocess";
    default:
      return "Process";
  }
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

  // Read page and limit from URL query params (default: page=1, limit=10)
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const { documents, pagination, getAllDocuments, deleteDocument, submitForProcessDocument } =
    useDocumentStore();

  useEffect(() => {
    getAllDocuments(orgId, projectId, page, limit);
  }, [orgId, projectId, page, limit]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", newLimit.toString());
    params.set("page", "1"); // Reset to first page on limit change
    setSearchParams(params);
  };

  const handleView = (doc: DocumentInterface) => {
    const url = `/organizations/${orgId}/projects/${projectId}/docs/${doc.id}/view`;
    navigate(url);
  };

  const handleObjectView = (doc: DocumentInterface) => {
    const url = `${import.meta.env.VITE_MINIO_URL}/browser/${doc.bucket}/${doc.key}`;
    window.open(url, "_blank");
  };

  const handleQueryDocument = (documentId: string) => {
    const url = `/organizations/${orgId}/projects/${projectId}/docs/${documentId}/query`;
    window.open(url, "_blank");
  };

  const handleDelete = async (doc: DocumentInterface) => {
    if (!confirm("Delete this document?")) return;
    await deleteDocument(orgId, projectId, doc.id);
    await getAllDocuments(orgId, projectId, page, limit);
  };

  const handleProcess = async (doc: DocumentInterface) => {
    try {
      const response = await submitForProcessDocument(orgId, projectId, doc.id);
      if (response === false) return;
      alert("Submitted for processing");
    } catch (error) {
      console.log(error);
    }
  };

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

  return (
    <div className="space-y-3 mb-10">
      {/* Top Controls Bar with Right-Aligned Pagination */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Documents</div>

        {/* Top-Right Pagination Controls */}
        <div className="flex items-center gap-3">
          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Rows:</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="bg-transparent border border-zinc-200 cursor-pointer dark:border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
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

          {/* Current Page Counter */}
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Page{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentPage}</span> of{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalPages}</span>
          </span>

          {/* Prev / Next Page Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 rounded-md border border-zinc-200 cursor-pointer dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-md border border-zinc-200 cursor-pointer dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
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
                {/* ID Column */}
                <td className="p-3 font-mono text-xs">
                  <button
                    onClick={() => handleCopyId(doc.id)}
                    className="flex items-center gap-1.5 px-2 py-1 -ml-2 cursor-pointer rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    title="Copy full ID"
                  >
                    {doc.id.substring(0, 8)}...
                    {copiedId === doc.id ? (
                      <span className="flex items-center text-green-500 dark:text-green-400">
                        <Check size={14} />
                      </span>
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </td>

                {/* Name Column */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(doc)}
                      className="cursor-pointer hover:opacity-90"
                    >
                      {getFileIcon(doc.name)}
                    </button>

                    <span title={doc.name}>
                      {doc.name.length > 20 ? `${doc.name.slice(0, 20)}...` : doc.name}
                    </span>

                    {doc.is_ocr_needed && (
                      <span
                        title="OCR processing required for this document"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-help"
                      >
                        <span>OCR</span>
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-3">{doc.type}</td>
                <td className="p-3 text-zinc-500">{formatBytes(doc.size)}</td>

                {/* Status Column */}
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

                {/* Action Menu */}
                <td className="p-3 text-right">
                  <DropdownMenu.Root>
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
                        onClick={() => handleView(doc)}
                        className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
                      >
                        View
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                      <DropdownMenu.Item
                        onClick={() => handleProcess(doc)}
                        disabled={doc.status === "PROCESSING" || doc.status === "QUEUED"}
                        className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {getProcessActionLabel(doc.status)}
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                      {doc.status === "PROCESSED" && (
                        <>
                          <DropdownMenu.Item
                            onClick={() => handleQueryDocument(doc.id)}
                            className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
                          >
                            Query
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                        </>
                      )}

                      <DropdownMenu.Item
                        onClick={() => handleObjectView(doc)}
                        className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
                      >
                        Open in Object Store
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                      <DropdownMenu.Item
                        onClick={() => handleDelete(doc)}
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
                  No documents found
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
