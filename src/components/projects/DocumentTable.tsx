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
  ScanText,
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
import { useNavigate } from "react-router-dom";

// Helper function to get the appropriate icon based on filename
const getFileIcon = (filename: string) => {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();

  if (DOCUMENT_EXTENSIONS.includes(ext)) {
    // Coloring PDF red and Word docs blue for better distinction
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

  // --- NEW: Audio and Video Checks ---
  if (AUDIO_EXTENSIONS.includes(ext)) {
    return <FileAudio size={16} className="text-pink-500" />;
  }
  if (VIDEO_EXTENSIONS.includes(ext)) {
    return <FileVideo size={16} className="text-indigo-500" />;
  }

  // Default icon
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

function DocumentTable({ orgId, projectId }: { orgId: string; projectId: string }) {
  const navigate = useNavigate();
  const { documents, getAllDocuments, deleteDocument, getPresignedUrl, submitForProcessDocument } =
    useDocumentStore();

  useEffect(() => {
    getAllDocuments(orgId, projectId);
  }, [orgId, projectId]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleView = async (doc: DocumentInterface) => {
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
    await getAllDocuments(orgId, projectId);
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
    setTimeout(() => setCopiedId(null), 1000); // Reset after 1 seconds
  };

  return (
    <div className="rounded-xl mb-10 border bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
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
              {/* ID Column with Copy Feature */}
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

              {/* Name Column with File Icon */}
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

                  {/* OCR Needed Indicator */}
                  {doc.is_ocr_needed && (
                    <span
                      title="OCR processing required for this document"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-help"
                    >
                      {/* <ScanText size={12} className="shrink-0" /> */}
                      <span>OCR</span>
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

              {/* ACTION MENU */}
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
                    {/* VIEW */}
                    <DropdownMenu.Item
                      onClick={() => handleView(doc)}
                      className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
                    >
                      View
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                    {/* PROCESS / RETRY */}
                    <DropdownMenu.Item
                      onClick={() => handleProcess(doc)}
                      disabled={doc.status === "PROCESSING" || doc.status === "QUEUED"}
                      className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {getProcessActionLabel(doc.status)}
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                    {/* Query */}
                    {doc.status === "PROCESSED" && (
                      <DropdownMenu.Item
                        onClick={() => handleQueryDocument(doc.id)}
                        className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
                      >
                        Query
                      </DropdownMenu.Item>
                    )}
                    {doc.status === "PROCESSED" && (
                      <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                    )}

                    {/* OBJECT STORE */}
                    <DropdownMenu.Item
                      onClick={() => handleObjectView(doc)}
                      className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none"
                    >
                      Open in Object Store
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                    {/* DELETE */}
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
  );
}

export default DocumentTable;
