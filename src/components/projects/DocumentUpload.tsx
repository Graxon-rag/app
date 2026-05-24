import React, { useState, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import axios from "axios";
import { useDocumentStore } from "@/store/documentStore";
import { useMultipartUploadStore } from "@/store/multipartStore";

const ALLOWED_EXTENSIONS = [".txt", ".pdf", ".md"];
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per chunk

function DocumentUpload({ orgId, projectId }: { orgId: string; projectId: string }) {
  const { getAllDocuments, initMultipartUpload, getPresignedPartUrl, completeMultipartUpload } =
    useDocumentStore();

  const { getSession, setSession, addPart, deleteSession } = useMultipartUploadStore();

  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const isValidFile = (file: File) => {
    const name = file.name.toLowerCase();
    return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  };

  const handleFile = async (file: File) => {
    setError(null);
    setProgress(0);

    if (!isValidFile(file)) {
      setError("Only .txt, .pdf, .md files are allowed");
      return;
    }

    try {
      setLoading(true);

      const session = getSession(file.name);
      const currentDocumentId = session?.documentId ?? crypto.randomUUID();
      let currentUploadId = session?.uploadId ?? null;
      let currentKey = session?.key ?? null;
      // Track locally to avoid stale reads
      const localCompletedParts: { etag: string; part_number: number }[] = session?.completedParts
        ? [...session.completedParts]
        : [];

      if (!currentUploadId || !currentKey) {
        const result = await initMultipartUpload(orgId, projectId, currentDocumentId, file.name);
        if (!result) {
          setError("Failed to initiate upload");
          return;
        }
        currentUploadId = result.uploadId;
        currentKey = result.key;
        setSession(file.name, currentDocumentId, currentUploadId, currentKey);
      }

      const totalParts = Math.ceil(file.size / CHUNK_SIZE);

      for (let i = 1; i <= totalParts; i++) {
        const alreadyUploaded = localCompletedParts.find((p) => p.part_number === i);
        if (alreadyUploaded) {
          setProgress(Math.round((i / totalParts) * 100));
          continue;
        }

        const start = (i - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const presignedUrl = await getPresignedPartUrl(
          orgId,
          projectId,
          currentDocumentId,
          currentUploadId,
          currentKey,
          i,
        );

        if (!presignedUrl) {
          setError(`Failed to get upload URL for part ${i}`);
          return;
        }

        const uploadRes = await axios.put(presignedUrl, chunk, {
          headers: { "Content-Type": file.type },
        });

        const etag = uploadRes.headers.etag;
        const part = { etag, part_number: i };
        localCompletedParts.push(part);
        addPart(file.name, part); // still persist to store

        setProgress(Math.round((i / totalParts) * 100));
      }

      const success = await completeMultipartUpload(
        orgId,
        projectId,
        currentDocumentId,
        currentUploadId,
        currentKey,
        file.name,
        localCompletedParts, // use local copy, not store read
      );

      if (!success) {
        setError("Failed to complete upload");
        return;
      }

      deleteSession(file.name);
      setProgress(100);
      await getAllDocuments(orgId, projectId);
    } catch (err) {
      console.error(err);
      setError("Upload failed. You can retry to resume.");
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
          disabled={loading}
        />

        {/* PROGRESS */}
        {loading && progress > 0 && (
          <div className="mt-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* LOADING TEXT */}
        {loading && (
          <p className="text-xs mt-2 text-zinc-500 animate-pulse">Uploading... {progress}%</p>
        )}

        {/* RESUME HINT */}
        {!loading && error && (
          <p className="text-xs mt-2 text-orange-500">
            Upload interrupted. Select the same file to resume.
          </p>
        )}

        {/* ERROR */}
        {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default DocumentUpload;
