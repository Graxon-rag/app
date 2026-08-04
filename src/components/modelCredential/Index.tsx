import React, { useEffect, useState } from "react";
import { Plus, Trash2, KeyRound, Sparkles, Server } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useModelProviderStore } from "@/store/modelProviderStore";
import { useModelCredentialStore } from "@/store/modelCredentialStore";
import CreateModelCredentialModal from "@/components/modelCredential/CreateModelCredentialModal";
import { ModelCredentialInterface } from "@/interfaces/ModelCredentialInterface";

const MODEL_TYPES = [
  { id: "llm", label: "LLM" },
  { id: "embedding", label: "Embedding" },
  { id: "sparse", label: "Sparse Text" },
  { id: "reranker", label: "Reranker" },
  { id: "ocr", label: "OCR" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
];

function ModelCredentialIndex() {
  const { org_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State Extraction
  const type = searchParams.get("type") || "llm";
  const deployment = searchParams.get("deployment") || "cloud";
  const provider = searchParams.get("provider") || "";

  // Stores
  const {
    getLLMModelProviders,
    getEmbeddingModelProviders,
    getAudioModelProviders,
    getOCRModelProviders,
    getVideoModelProviders,
    getRerankerModelProviders,
    getSparseModelProviders,
  } = useModelProviderStore();

  const { modelCredentials, getAllModelCredentials, deleteModelCredential } =
    useModelCredentialStore();

  // Local State
  const [providers, setProviders] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [doubleConfirm, setDoubleConfirm] = useState<string | null>(null);

  const isLocalCloudType = type === "sparse" || type === "reranker";
  const isLocal = isLocalCloudType && deployment === "local";

  // Effect: Fetch Providers based on selected type
  useEffect(() => {
    const fetchProviders = async () => {
      let data: string[] = [];
      switch (type) {
        case "llm":
          data = (await getLLMModelProviders()) || [];
          break;
        case "embedding":
          data = (await getEmbeddingModelProviders()) || [];
          break;
        case "sparse":
          data = (await getSparseModelProviders()) || [];
          break;
        case "reranker":
          data = (await getRerankerModelProviders()) || [];
          break;
        case "ocr":
          data = (await getOCRModelProviders()) || [];
          break;
        case "audio":
          data = (await getAudioModelProviders()) || [];
          break;
        case "video":
          data = (await getVideoModelProviders()) || [];
          break;
      }
      setProviders(data);

      // Auto-select the first provider if the current one is invalid for this type
      if (data.length > 0 && !data.includes(provider)) {
        setSearchParams((prev) => {
          prev.set("provider", data[0]);
          return prev;
        });
      }
    };
    fetchProviders();
  }, [
    type,
    provider,
    setSearchParams,
    getLLMModelProviders,
    getEmbeddingModelProviders,
    getSparseModelProviders,
    getRerankerModelProviders,
    getOCRModelProviders,
    getAudioModelProviders,
    getVideoModelProviders,
  ]);

  // Effect: Fetch Credentials for selected provider (Skip if Local)
  useEffect(() => {
    if (org_id && provider && !isLocal) {
      getAllModelCredentials(org_id, provider);
    }
  }, [org_id, provider, isLocal, getAllModelCredentials]);

  // Handlers
  const handleTypeChange = (newType: string) => {
    const newDeployment = ["sparse", "reranker"].includes(newType) ? deployment : "cloud";
    setSearchParams({ type: newType, deployment: newDeployment }); // Excludes provider so effect autosets it
  };

  const handleDeploymentChange = (newDeployment: string) => {
    setSearchParams({ type, deployment: newDeployment, provider });
  };

  const handleProviderChange = (newProvider: string) => {
    setSearchParams({ type, deployment, provider: newProvider });
  };

  const handleDelete = async (id: string) => {
    if (!org_id) return;
    if (doubleConfirm !== id) {
      setDoubleConfirm(id);
      return;
    }
    await deleteModelCredential(org_id, provider, id);
    setConfirmDelete(null);
    setDoubleConfirm(null);
  };

  const isEmpty = !modelCredentials || modelCredentials.length === 0;

  return (
    <div className="space-y-6 max-w-[1450px] mx-auto">
      {/* HEADER */}
      <h1 className="text-xl font-semibold text-black dark:text-white">Model Credentials</h1>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. Type Select */}
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="h-9 px-3 rounded-lg border text-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 outline-none focus:border-zinc-500 transition-colors cursor-pointer"
          >
            {MODEL_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {/* 2. Deployment Toggle (Reranker & Sparse only) */}
          {isLocalCloudType && (
            <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-800">
              {(["cloud", "local"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleDeploymentChange(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                    deployment === t
                      ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* 3. Provider Select */}
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            disabled={providers.length === 0}
            className="h-9 px-3 rounded-lg border text-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 outline-none focus:border-zinc-500 transition-colors cursor-pointer disabled:opacity-50"
          >
            <option value="" disabled>
              {providers.length === 0 ? "No providers found" : "Select provider"}
            </option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Create */}
        {!isLocal && (
          <button
            onClick={() => setOpen(true)}
            disabled={!provider}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            <Plus size={14} />
            Add Credential
          </button>
        )}
      </div>

      {/* STATES */}
      {isLocal ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800 mb-5 text-zinc-500">
            <Server className="w-8 h-8" />
          </div>
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
            Local Deployments
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
            Local models run directly inside your Kubernetes cluster. They do not require external
            API credentials or keys to operate.
          </p>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800 mb-5 text-zinc-500">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
            No credentials for this provider yet
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
            Add an API key for{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {provider || "this provider"}
            </span>{" "}
            to start using its models across your pipelines.
          </p>
          <button
            onClick={() => setOpen(true)}
            disabled={!provider}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            <Sparkles size={14} />
            Add your first credential
          </button>
        </div>
      ) : (
        /* GRID */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modelCredentials.map((cred: ModelCredentialInterface) => (
            <div
              key={cred.id}
              className="p-5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex flex-col h-full shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-black dark:text-white truncate">{cred.name}</h2>
                  <p className="text-xs text-zinc-500 capitalize mt-0.5">{cred.provider}</p>
                </div>
                <button
                  onClick={() => setConfirmDelete(cred.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-2 mb-4 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg flex-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    API Key
                  </span>
                  <span className="font-mono text-xs break-all">{cred.api_key}</span>
                </div>
                {cred.description && (
                  <div className="flex flex-col gap-1 pt-2 border-t border-zinc-200 dark:border-zinc-700/50">
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Description
                    </span>
                    <span className="text-xs line-clamp-2">{cred.description}</span>
                  </div>
                )}
              </div>

              {confirmDelete === cred.id && (
                <div className="flex justify-end gap-2 pt-3 mt-auto border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      setConfirmDelete(null);
                      setDoubleConfirm(null);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(cred.id)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition"
                  >
                    {doubleConfirm === cred.id ? "Confirm Delete" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <CreateModelCredentialModal open={open} onClose={() => setOpen(false)} provider={provider} />
    </div>
  );
}

export default ModelCredentialIndex;
