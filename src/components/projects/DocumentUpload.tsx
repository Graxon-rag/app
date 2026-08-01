import React, { useState, useCallback } from "react";
import { UploadCloud, CheckCircle2, RotateCcw, ScanText } from "lucide-react";
import axios from "axios";
import { useDocumentStore } from "@/store/documentStore";
import { useMultipartUploadStore } from "@/store/multipartStore";
import {
  FILE_INPUT_ACCEPT,
  isAllowedFile,
  getDocumentCategory,
  isOcrCandidate,
  DocumentCategory,
} from "@/libs/documentTypes";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per chunk

type UploadStatus = "idle" | "uploading" | "ready_to_complete" | "completing" | "completed";

type PendingUpload = {
  file: File;
  documentId: string;
  uploadId: string;
  key: string;
  completedParts: { etag: string; part_number: number }[];
  category: DocumentCategory;
  ocrCandidate: boolean;
};

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  video: "Video",
};

function DocumentUpload({ orgId, projectId }: { orgId: string; projectId: string }) {
  const { getAllDocuments, initMultipartUpload, getPresignedPartUrl, completeMultipartUpload } =
    useDocumentStore();

  const { getSession, setSession, addPart, deleteSession } = useMultipartUploadStore();

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState<PendingUpload | null>(null);

  const reset = () => {
    setStatus("idle");
    setError(null);
    setProgress(0);
    setPending(null);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setProgress(0);

    if (!isAllowedFile(file.name)) {
      setError("This file type isn't supported yet.");
      return;
    }

    const category = getDocumentCategory(file.name);
    const ocrCandidate = isOcrCandidate(file.name);

    try {
      setStatus("uploading");

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
          setStatus("idle");
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
          setStatus("idle");
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

      // All parts are uploaded — wait for the user to hit "Complete"
      // instead of auto-finalizing, so they can confirm before the
      // backend kicks off processing.
      setPending({
        file,
        documentId: currentDocumentId,
        uploadId: currentUploadId,
        key: currentKey,
        completedParts: localCompletedParts,
        category,
        ocrCandidate,
      });
      setStatus("ready_to_complete");
    } catch (err) {
      console.error(err);
      setError("Upload failed. You can retry to resume.");
      setStatus("idle");
    }
  };

  const handleComplete = async () => {
    if (!pending) return;

    setStatus("completing");
    setError(null);

    try {
      const success = await completeMultipartUpload(
        orgId,
        projectId,
        pending.documentId,
        pending.uploadId,
        pending.key,
        pending.file.name,
        pending.file.size,
        pending.completedParts,
      );

      if (!success) {
        setError("Failed to complete upload. You can try again.");
        setStatus("ready_to_complete");
        return;
      }

      deleteSession(pending.file.name);
      await getAllDocuments(orgId, projectId);
      setStatus("completed");
    } catch (err) {
      console.error(err);
      setError("Failed to complete upload. You can try again.");
      setStatus("ready_to_complete");
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

  const loading = status === "uploading" || status === "completing";
  const inputDisabled = loading || status === "ready_to_complete" || status === "completed";

  return (
    <div className="w-full mt-5 max-w-2xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!inputDisabled) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={inputDisabled ? undefined : handleDrop}
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
          {status === "completed" ? (
            <CheckCircle2 size={36} className="text-green-500" />
          ) : (
            <UploadCloud size={36} className={dragActive ? "text-primary-500" : "text-zinc-400"} />
          )}
        </div>

        {/* TEXT */}
        {status === "completed" ? (
          <>
            <h2 className="text-sm font-medium">Upload complete</h2>
            <p className="text-xs text-zinc-500 mt-1 truncate">{pending?.file.name}</p>
          </>
        ) : (
          <>
            <h2 className="text-sm font-medium">Drag & drop your file here</h2>
            <p className="text-xs text-zinc-500 mt-1">
              or click to browse — pdfs, texts, docs, sheets, slides, code, images, audio & video
            </p>
          </>
        )}

        {/* INPUT — only mounted while idle so it can't sit on top of the
            Complete button (an absolutely-positioned element paints above
            normal-flow siblings regardless of DOM order, so leaving this
            mounted-but-disabled during later states was swallowing clicks) */}
        {status === "idle" && (
          <input
            type="file"
            accept={FILE_INPUT_ACCEPT}
            onChange={handleChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        )}

        {/* PROGRESS */}
        {status === "uploading" && progress > 0 && (
          <div className="mt-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
            <div
              className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* LOADING TEXT */}
        {status === "uploading" && (
          <p className="text-xs mt-2 text-zinc-500 animate-pulse">Uploading... {progress}%</p>
        )}

        {/* CLASSIFICATION + COMPLETE BUTTON */}
        {(status === "ready_to_complete" || status === "completing") && pending && (
          <div
            className="mt-4 flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {CATEGORY_LABEL[pending.category]}
              </span>

              {pending.ocrCandidate && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                  <ScanText className="w-3 h-3" />
                  May need OCR
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleComplete}
              disabled={status === "completing"}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {status === "completing" ? "Completing..." : "Complete Upload"}
            </button>
          </div>
        )}

        {/* UPLOAD ANOTHER */}
        {status === "completed" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Upload another
          </button>
        )}

        {/* RESUME HINT */}
        {status === "idle" && error && (
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
