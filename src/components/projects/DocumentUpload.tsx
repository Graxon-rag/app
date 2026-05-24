import React, { useState, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";

const ALLOWED_EXTENSIONS = [".txt", ".pdf", ".md"];

function DocumentUpload({ orgId, projectId }: { orgId: string; projectId: string }) {
  const { uploadDocument, getAllDocuments } = useDocumentStore();

  const [documentId] = useState(() => crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidFile = (file: File) => {
    const name = file.name.toLowerCase();
    return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  };

  const handleFile = async (file: File) => {
    setError(null);

    if (!isValidFile(file)) {
      setError("Only .txt, .pdf, .md files are allowed");
      return;
    }

    try {
      setLoading(true);
      await uploadDocument(orgId, projectId, documentId, file);
      await getAllDocuments(orgId, projectId);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    await handleFile(e.target.files[0]);
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files?.length) {
      await handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="w-full mt-5 max-w-2xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative p-6 rounded-2xl border transition text-center
        ${
          dragActive
            ? "border-primary-500 bg-primary-500/10"
            : "border-zinc-200 dark:border-zinc-800"
        }
        bg-white dark:bg-zinc-900`}
      >
        {/* ICON */}
        <div className="flex justify-center mb-3">
          <UploadCloud size={36} className={dragActive ? "text-primary-500" : "text-zinc-400"} />
        </div>

        {/* TEXT */}
        <h2 className="text-sm font-medium">Drag & drop your file here</h2>
        <p className="text-xs text-zinc-500 mt-1">or click to browse (.txt, .pdf, .md)</p>

        {/* INPUT */}
        <input
          type="file"
          accept=".txt,.pdf,.md"
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        {/* ERROR */}
        {error && <p className="text-xs mt-3 text-red-500">{error}</p>}

        {/* LOADING */}
        {loading && <p className="text-xs mt-3 text-zinc-500 animate-pulse">Uploading...</p>}
      </div>
    </div>
  );
}

export default DocumentUpload;
