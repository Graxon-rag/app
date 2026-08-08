import React, { useState, useCallback, useEffect } from "react";
import {
  UploadCloud,
  CheckCircle2,
  RotateCcw,
  ScanText,
  FileText,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useDocumentStore } from "@/store/documentStore";
import { useMultipartUploadStore } from "@/store/multipartStore";
import { useProjectStore } from "@/store/projectStore"; // Added project store import
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
  useOcr: boolean;
};

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  video: "Video",
};

// Helper: Sanitize filename by trimming, replacing non a-zA-Z0-9 with '_', and preserving the extension
function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf(".");

  if (lastDot === -1) {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_") // Replaces spaces, special chars, and multiple ___ with a single _
      .replace(/^_+|_+$/g, ""); // Removes trailing or leading underscores
  }

  const baseName = name.substring(0, lastDot);
  const ext = name.substring(lastDot);

  const cleanBase = baseName
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_") // Squashes double spaces or double __ into a single _
    .replace(/^_+|_+$/g, ""); // Cleans up _ at the very start or end

  // If the filename becomes empty after cleaning (e.g., "___ .pdf"), give it a fallback name
  const finalBase = cleanBase.length > 0 ? cleanBase : "document";

  return `${finalBase}${ext}`;
}
export function DocumentUpload({ orgId, projectId }: { orgId: string; projectId: string }) {
  const { getAllDocuments, initMultipartUpload, getPresignedPartUrl, completeMultipartUpload } =
    useDocumentStore();

  const { getSession, setSession, addPart, deleteSession } = useMultipartUploadStore();
  const { getProjectConfigDetailsByProject } = useProjectStore();

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState<PendingUpload | null>(null);

  // Track project configuration for OCR validation
  const [projectConfig, setProjectConfig] = useState<any | null>(null);

  // Fetch project config to verify if OCR model is available
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const config = await getProjectConfigDetailsByProject(orgId, projectId);
        if (isMounted) setProjectConfig(config);
      } catch (err) {
        console.error("Failed to fetch project config", err);
      }
    };
    if (projectId) fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [projectId, getProjectConfigDetailsByProject]);

  const hasOcrModel = !!projectConfig?.ocr_model;

  const reset = () => {
    setStatus("idle");
    setError(null);
    setProgress(0);
    setPending(null);
  };

  const handleFile = async (rawFile: File) => {
    setError(null);
    setProgress(0);

    const safeName = sanitizeFileName(rawFile.name);
    const file = new File([rawFile], safeName, { type: rawFile.type });

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
        addPart(file.name, part);

        setProgress(Math.round((i / totalParts) * 100));
      }

      setPending({
        file,
        documentId: currentDocumentId,
        uploadId: currentUploadId,
        key: currentKey,
        completedParts: localCompletedParts,
        category,
        ocrCandidate,
        useOcr: false,
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
        pending.useOcr,
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

  const inputDisabled = status !== "idle";

  return (
    <div className="w-full mt-5 max-w-3xl mx-auto flex flex-col gap-6">
      {/* DROPZONE - Hidden when configuration is active to keep UI clean */}
      {(status === "idle" || status === "uploading") && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!inputDisabled) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={inputDisabled ? undefined : handleDrop}
          className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all
          ${
            dragActive
              ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
              : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <UploadCloud
            size={42}
            className={`mb-4 ${dragActive ? "text-primary-500" : "text-zinc-400 dark:text-zinc-500"}`}
          />

          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            Select or drag & drop your file
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 text-center max-w-sm">
            Supported formats include PDFs, docs, sheets, slides, images, audio & video
          </p>

          {status === "idle" && (
            <input
              type="file"
              accept={FILE_INPUT_ACCEPT}
              onChange={handleChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          )}

          {/* PROGRESS BAR */}
          {status === "uploading" && (
            <div className="mt-6 w-full max-w-md">
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm font-medium mt-2 text-zinc-600 dark:text-zinc-400 text-center animate-pulse">
                Uploading... {progress}%
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm mt-4 text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-md">
              {error}
            </p>
          )}
        </div>
      )}

      {/* CONFIGURATION & COMPLETION CARD */}
      {(status === "ready_to_complete" || status === "completing" || status === "completed") &&
        pending && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm">
            {/* File Summary Header */}
            <div className="flex items-start justify-between pb-5 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
                  {status === "completed" ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] md:max-w-sm">
                    {pending.file.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {CATEGORY_LABEL[pending.category]} Document
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">
                      {(pending.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>

              {status === "completed" && (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full">
                  Uploaded
                </span>
              )}
            </div>

            {/* Configuration Options */}
            {status !== "completed" && (
              <div className="py-5 space-y-4">
                {pending.ocrCandidate && (
                  <div
                    className={`p-4 rounded-xl border ${pending.useOcr ? "border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-900/10" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"} transition-colors`}
                  >
                    <div className="flex gap-4">
                      <div className="mt-0.5">
                        <ScanText
                          className={`w-5 h-5 ${pending.useOcr ? "text-primary-600 dark:text-primary-400" : "text-zinc-400 dark:text-zinc-500"}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Extract Text from Images (OCR)
                          </h4>

                          {/* Custom Toggle Switch */}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={pending.useOcr}
                            disabled={!hasOcrModel || status === "completing"}
                            onClick={() => setPending({ ...pending, useOcr: !pending.useOcr })}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 
                            ${pending.useOcr ? "bg-primary-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pending.useOcr ? "translate-x-2" : "-translate-x-2"}`}
                            />
                          </button>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                          If your document contains images, scanned pages, or embedded diagrams,
                          enabling OCR will extract the text inside them so it can be searched and
                          analyzed by the AI.
                        </p>

                        {!hasOcrModel && (
                          <div className="flex items-start gap-1.5 mt-3 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 p-2 rounded-lg">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>
                              OCR cannot be enabled because an OCR model has not been configured for
                              this project. Please update your project configs.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions Footer */}
            <div className="pt-4 flex items-center justify-end gap-3 mt-2">
              {error && <span className="text-sm text-red-500 mr-auto">{error}</span>}

              {status !== "completed" ? (
                <>
                  <button
                    type="button"
                    onClick={reset}
                    disabled={status === "completing"}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={status === "completing"}
                    className="px-5 py-2 text-sm cursor-pointer font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition shadow-sm disabled:opacity-70 flex items-center gap-2"
                  >
                    {status === "completing" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Upload"
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Upload Another Document
                </button>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

export default DocumentUpload;
