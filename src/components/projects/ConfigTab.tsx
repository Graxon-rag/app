import React, { useState, useEffect, useMemo, useCallback } from "react";
import ConfigCard from "./ConfigCard";
import {
  ProjectConfigGetInterface,
  ProjectConfigUpdateInterface,
} from "@/interfaces/ProjectInterface";
import { useProjectStore } from "@/store/projectStore";

import { useLLMModelStore } from "@/store/llmModelStore";
import { useSparseTextModelStore } from "@/store/sparseTextModelStore";
import { useReRankerModelStore } from "@/store/reRankerModelStore";
import { useOCRModelStore } from "@/store/ocrModelStore";
import { useAudioModelStore } from "@/store/audioModelStore";
import { useVideoModelStore } from "@/store/videoModelStore";
import { useModelCredentialStore } from "@/store/modelCredentialStore";
import { useModelProviderStore } from "@/store/modelProviderStore";
import { X, Loader2 } from "lucide-react";

// ─── types & primitives ────────────────────────────────────────────────────────
type EditableModelType = "llm" | "sparse" | "reranker" | "ocr" | "audio" | "video";
type ProviderType = "local" | "cloud";

interface ConfigTabProps {
  orgId: string;
  projectId: string;
}

const LABEL = "block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-1.5";
const INPUT =
  "w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm outline-none focus:border-zinc-500 transition-colors";
const SELECT = INPUT + " appearance-none cursor-pointer";

function Ghost({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-9 px-3 flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 text-zinc-500 text-sm select-none">
      {children}
    </div>
  );
}

// ─── Update Modal Component ───────────────────────────────────────────────────
function UpdateModelModal({
  isOpen,
  onClose,
  onSuccess,
  type,
  orgId,
  projectId,
  configId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: EditableModelType | null;
  orgId: string;
  projectId: string;
  configId: string;
}) {
  const { updateProjectConfig } = useProjectStore();

  const { llmModels, getAllProviderLLMModels } = useLLMModelStore();
  const { sparseTextModels, getAllSparseTextModels } = useSparseTextModelStore();
  const { reRankerModels, getAllReRankerModels } = useReRankerModelStore();
  const { ocrModels, getAllProviderOCRModels } = useOCRModelStore();
  const { audioModels, getAllProviderAudioModels } = useAudioModelStore();
  const { videoModels, getAllProviderVideoModels } = useVideoModelStore();

  const { getAllModelCredentials } = useModelCredentialStore();
  const {
    getLLMModelProviders,
    getSparseModelProviders,
    getRerankerModelProviders,
    getOCRModelProviders,
    getAudioModelProviders,
    getVideoModelProviders,
  } = useModelProviderStore();

  const [providers, setProviders] = useState<string[]>([]);
  const [deploymentType, setDeploymentType] = useState<ProviderType | "">("");
  const [provider, setProvider] = useState("");
  const [modelId, setModelId] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [credentials, setCredentials] = useState<{ id: string; name: string }[] | null>(null);

  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !type || !orgId) return;

    setProviders([]);
    setDeploymentType("");
    setProvider("");
    setModelId("");
    setCredentialId("");
    setCredentials(null);
    setError(null);

    const fetchProviders = async () => {
      let data: string[] = [];
      switch (type) {
        case "llm":
          data = (await getLLMModelProviders()) || [];
          break;
        case "sparse":
          data = (await getSparseModelProviders()) || [];
          getAllSparseTextModels(orgId);
          break;
        case "reranker":
          data = (await getRerankerModelProviders()) || [];
          getAllReRankerModels(orgId);
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
    };

    fetchProviders();
  }, [isOpen, type, orgId]);

  const handleProviderChange = async (newProvider: string) => {
    setProvider(newProvider);
    setModelId("");
    setCredentialId("");
    setCredentials(null);
    if (!newProvider || !orgId) return;

    setLoadingCreds(true);
    await getAllModelCredentials(orgId, newProvider);
    setCredentials(useModelCredentialStore.getState().modelCredentials);
    setLoadingCreds(false);

    if (!["sparse", "reranker"].includes(type || "")) {
      setLoadingModels(true);
      switch (type) {
        case "llm":
          await getAllProviderLLMModels(orgId, newProvider);
          break;
        case "ocr":
          await getAllProviderOCRModels(orgId, newProvider);
          break;
        case "audio":
          await getAllProviderAudioModels(orgId, newProvider);
          break;
        case "video":
          await getAllProviderVideoModels(orgId, newProvider);
          break;
      }
      setLoadingModels(false);
    }
  };

  const activeModels = useMemo(() => {
    switch (type) {
      case "llm":
        return llmModels;
      case "ocr":
        return ocrModels;
      case "audio":
        return audioModels;
      case "video":
        return videoModels;
      case "sparse":
        return (sparseTextModels ?? []).filter(
          (m: any) =>
            (!deploymentType || m.provider_type === deploymentType) &&
            (!provider || m.provider === provider),
        );
      case "reranker":
        return (reRankerModels ?? []).filter(
          (m: any) =>
            (!deploymentType || m.provider_type === deploymentType) &&
            (!provider || m.provider === provider),
        );
      default:
        return [];
    }
  }, [
    type,
    llmModels,
    ocrModels,
    audioModels,
    videoModels,
    sparseTextModels,
    reRankerModels,
    deploymentType,
    provider,
  ]);

  const needsDeploymentType = type === "sparse" || type === "reranker";
  const needsCredential = !needsDeploymentType || deploymentType === "cloud";

  const isFormValid = useMemo(() => {
    if (needsDeploymentType && !deploymentType) return false;
    if (!provider || !modelId) return false;
    if (needsCredential && !credentialId) return false;
    return true;
  }, [needsDeploymentType, deploymentType, provider, modelId, needsCredential, credentialId]);

  const handleSubmit = async () => {
    if (!isFormValid || !configId || !type) return;
    setSubmitting(true);
    setError(null);

    const payload: ProjectConfigUpdateInterface = {};

    switch (type) {
      case "llm":
        payload.llm_model_id = modelId;
        payload.llm_model_credential_id = credentialId;
        break;
      case "sparse":
        payload.sparse_text_model_id = modelId;
        payload.sparse_text_model_credential_id = credentialId || null;
        break;
      case "reranker":
        payload.reranker_model_id = modelId;
        payload.reranker_model_credential_id = credentialId || null;
        payload.reranker_enable = true;
        break;
      case "ocr":
        payload.ocr_model_id = modelId;
        payload.ocr_model_credential_id = credentialId;
        break;
      case "audio":
        payload.audio_model_id = modelId;
        payload.audio_model_credential_id = credentialId;
        break;
      case "video":
        payload.video_model_id = modelId;
        payload.video_model_credential_id = credentialId;
        break;
    }

    try {
      await updateProjectConfig(orgId, projectId, configId, payload);
      onSuccess(); // Trigger refresh in parent
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update configuration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#121214] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800/80">
          <h2 className="text-base font-semibold capitalize text-black dark:text-white">
            Update {type} Model
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {needsDeploymentType && (
            <div>
              <label className={LABEL}>Deployment</label>
              <div className="flex gap-2">
                {(["local", "cloud"] as ProviderType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setDeploymentType(t);
                      setProvider("");
                      setModelId("");
                      setCredentialId("");
                    }}
                    className={`h-9 px-4 rounded-lg text-sm border transition-colors capitalize ${
                      deploymentType === t
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-white text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(!needsDeploymentType || deploymentType) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Provider</label>
                <select
                  className={SELECT}
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                >
                  <option value="" disabled>
                    Select provider
                  </option>
                  {providers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL}>Model</label>
                {!provider ? (
                  <Ghost>choose provider</Ghost>
                ) : loadingModels ? (
                  <Ghost>fetching…</Ghost>
                ) : activeModels.length === 0 ? (
                  <Ghost>no models</Ghost>
                ) : (
                  <select
                    className={SELECT}
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                  >
                    <option value="">Select model</option>
                    {activeModels.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {needsCredential && provider && (
            <div>
              <label className={LABEL}>Credential</label>
              {loadingCreds ? (
                <Ghost>fetching…</Ghost>
              ) : credentials?.length === 0 ? (
                <div className="w-full h-9 px-3 flex items-center rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm select-none">
                  No credentials found.
                </div>
              ) : (
                <select
                  className={SELECT}
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                >
                  <option value="">Select credential</option>
                  {credentials?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {!needsCredential && provider && (
            <p className="text-[11px] text-zinc-500">
              Local models run in-cluster — no credential needed.
            </p>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/30 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
function ConfigTab({ orgId, projectId }: ConfigTabProps) {
  const { getProjectConfigByProject } = useProjectStore();

  // Note: Using `any` or extending your local interface if the backend returns populated nested objects
  const [config, setConfig] = useState<ProjectConfigGetInterface | any>(null);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<EditableModelType | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProjectConfigByProject(orgId, projectId);
      console.log("Fetched project config", data);
      setConfig(data);
    } catch (error) {
      console.error("Failed to fetch project config", error);
    } finally {
      setLoading(false);
    }
  }, [orgId, projectId, getProjectConfigByProject]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-20 text-sm text-zinc-500">
        Configuration could not be loaded.
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <ConfigCard
          title="LLM Model"
          subtitle={config?.llm_model?.name}
          editable={true}
          onEdit={() => setEditingType("llm")}
          fields={[
            { label: "ID", value: config?.llm_model?.id, mono: true },
            { label: "Model", value: config?.llm_model?.model_id, mono: true },
            { label: "Provider", value: config?.llm_model?.provider },
            { label: "Description", value: config?.llm_model?.description },
          ]}
        />

        <ConfigCard
          title="Embedding Model"
          subtitle={config?.embedding_model?.name}
          editable={false}
          fields={[
            { label: "ID", value: config?.embedding_model?.id, mono: true },
            { label: "Model", value: config?.embedding_model?.model_id, mono: true },
            { label: "Provider", value: config?.embedding_model?.provider },
            { label: "Dimension", value: config?.embedding_model?.dimension },
            { label: "Description", value: config?.embedding_model?.description },
          ]}
        />

        <ConfigCard
          title="Sparse Model"
          subtitle={config?.sparse_text_model?.name}
          editable={true}
          onEdit={() => setEditingType("sparse")}
          fields={[
            { label: "ID", value: config?.sparse_text_model?.id, mono: true },
            { label: "Provider", value: config?.sparse_text_model?.provider },
            { label: "Description", value: config?.sparse_text_model?.description },
          ]}
        />

        <ConfigCard
          title="Reranker"
          subtitle={config?.reranker?.name}
          editable={true}
          onEdit={() => setEditingType("reranker")}
          fields={[
            { label: "ID", value: config?.reranker?.id, mono: true },
            { label: "Provider", value: config?.reranker?.provider },
            { label: "Model", value: config?.reranker?.model_name, mono: true },
            { label: "Description", value: config?.reranker?.description },
          ]}
        />

        <ConfigCard
          title="LLM Credential"
          subtitle={config?.llm_model_credential?.name}
          editable={false}
          fields={[
            { label: "Provider", value: config?.llm_model_credential?.provider },
            { label: "API Key", value: config?.llm_model_credential?.api_key, mono: true },
            { label: "Description", value: config?.llm_model_credential?.description },
          ]}
        />

        <ConfigCard
          title="Embedding Credential"
          subtitle={config?.embedding_model_credential?.name}
          editable={false}
          fields={[
            { label: "Provider", value: config?.embedding_model_credential?.provider },
            { label: "API Key", value: config?.embedding_model_credential?.api_key, mono: true },
            { label: "Description", value: config?.embedding_model_credential?.description },
          ]}
        />
      </div>

      <UpdateModelModal
        isOpen={!!editingType}
        type={editingType}
        onClose={() => setEditingType(null)}
        onSuccess={fetchConfig}
        orgId={orgId}
        projectId={projectId}
        configId={config?.id}
      />
    </>
  );
}

export default ConfigTab;
