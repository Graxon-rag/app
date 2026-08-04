import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLLMModelStore } from "@/store/llmModelStore";
import { useEmbeddingModelStore } from "@/store/embeddingModelStore";
import { useSparseTextModelStore } from "@/store/sparseTextModelStore";
import { useReRankerModelStore } from "@/store/reRankerModelStore";
import { useOCRModelStore } from "@/store/ocrModelStore";
import { useAudioModelStore } from "@/store/audioModelStore";
import { useVideoModelStore } from "@/store/videoModelStore";
import { useModelCredentialStore } from "@/store/modelCredentialStore";
import { useModelProviderStore } from "@/store/modelProviderStore";
import { useProjectStore } from "@/store/projectStore";
import { TriangleAlert } from "lucide-react";

// ─── types ──────────────────────────────────────────────────────────────────
type ProviderType = "local" | "cloud";

interface ProjectConfigCreatePayload {
  graph_db_enable: boolean;
  sparse_embedding_enable: boolean;
  reranker_enable: boolean;
  llm_tag_extraction_enable: boolean;

  llm_model_id: string;
  llm_model_credential_id: string;

  embedding_model_id: string;
  embedding_model_credential_id: string;

  sparse_text_model_id: string | null;
  sparse_text_model_credential_id: string | null;

  reranker_model_id: string | null;
  reranker_model_credential_id: string | null;

  ocr_model_id: string | null;
  ocr_model_credential_id: string | null;

  audio_model_id: string | null;
  audio_model_credential_id: string | null;

  video_model_id: string | null;
  video_model_credential_id: string | null;
}

interface CreateProjectPayload {
  org_id: string;
  name: string;
  description: string;
  project_metadata: Record<string, unknown>;
  config: ProjectConfigCreatePayload;
}

// ─── primitives ─────────────────────────────────────────────────────────────
const LABEL =
  "block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5";

const INPUT =
  "w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors";

const SELECT = INPUT + " appearance-none cursor-pointer";

const CARD =
  "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm";

// ─── components ─────────────────────────────────────────────────────────────
function SectionHeading({
  dot,
  title,
  pill,
  optional,
}: {
  dot: string;
  title: string;
  pill?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="text-xs font-medium text-zinc-400">{title}</span>
      {optional && (
        <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-800 bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          optional
        </span>
      )}
      {pill && (
        <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400">
          {pill}
        </span>
      )}
    </div>
  );
}

function Ghost({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-9 px-3 flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-sm select-none">
      {children}
    </div>
  );
}

function LockNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-2 flex items-start gap-1.5">
      <span className="mt-[1px]">⚠</span>
      <span>{children}</span>
    </p>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  locked,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  locked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm text-black dark:text-white font-medium">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-black dark:bg-white" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white dark:bg-black transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      {locked !== undefined && null}
    </div>
  );
}

function CredentialSelect({
  provider,
  credentials,
  value,
  onChange,
  loading,
}: {
  provider: string;
  credentials: { id: string; name: string }[] | null;
  value: string;
  onChange: (id: string) => void;
  loading: boolean;
}) {
  if (!provider) return <Ghost>choose provider first</Ghost>;
  if (loading) return <Ghost>fetching…</Ghost>;
  if (credentials && credentials.length === 0) {
    return (
      <div className="w-full h-9 px-3 flex items-center rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm select-none truncate">
        No credentials found. Please add one.
      </div>
    );
  }
  return (
    <select className={SELECT} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select credential</option>
      {credentials?.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

function ProviderRow({
  providers,
  providerValue,
  onProviderChange,
  modelOptions,
  modelValue,
  onModelChange,
  loading,
  modelLabel = "Model",
  disabled,
}: {
  providers: string[];
  providerValue: string;
  onProviderChange: (p: string) => void;
  modelOptions: { id: string; name: string }[] | null;
  modelValue: string;
  onModelChange: (id: string) => void;
  loading: boolean;
  modelLabel?: string;
  disabled?: boolean;
}) {
  const options = modelOptions ?? [];

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className={LABEL}>Provider</label>
        <select
          className={SELECT}
          value={providerValue}
          disabled={disabled}
          onChange={(e) => onProviderChange(e.target.value)}
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
        <label className={LABEL}>{modelLabel}</label>
        {!providerValue ? (
          <Ghost>choose provider first</Ghost>
        ) : loading ? (
          <Ghost>fetching…</Ghost>
        ) : options.length === 0 ? (
          <Ghost>no models found</Ghost>
        ) : (
          <select
            className={SELECT}
            value={modelValue}
            disabled={disabled}
            onChange={(e) => onModelChange(e.target.value)}
          >
            <option value="">Select {modelLabel.toLowerCase()}</option>
            {options.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

function LocalCloudProviderRow({
  providerType,
  onProviderTypeChange,
  providers,
  providerValue,
  onProviderChange,
  modelOptions,
  modelValue,
  onModelChange,
  loading,
}: {
  providerType: ProviderType | "";
  onProviderTypeChange: (t: ProviderType) => void;
  providers: string[];
  providerValue: string;
  onProviderChange: (p: string) => void;
  modelOptions: { id: string; name: string }[] | null;
  modelValue: string;
  onModelChange: (id: string) => void;
  loading: boolean;
}) {
  const options = modelOptions ?? [];

  return (
    <div className="space-y-2">
      <div>
        <label className={LABEL}>Deployment</label>
        <div className="flex gap-2">
          {(["local", "cloud"] as ProviderType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onProviderTypeChange(t)}
              className={`h-9 px-4 rounded-lg text-sm border transition-colors capitalize ${
                providerType === t
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                  : "bg-white text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {providerType && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={LABEL}>Provider</label>
            <select
              className={SELECT}
              value={providerValue}
              onChange={(e) => onProviderChange(e.target.value)}
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
            {!providerValue ? (
              <Ghost>choose provider first</Ghost>
            ) : loading ? (
              <Ghost>fetching…</Ghost>
            ) : options.length === 0 ? (
              <Ghost>no models found</Ghost>
            ) : (
              <select
                className={SELECT}
                value={modelValue}
                onChange={(e) => onModelChange(e.target.value)}
              >
                <option value="">Select model</option>
                {options.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── page ───────────────────────────────────────────────────────────────────
export default function CreateProjectIndex() {
  const { org_id } = useParams<{ org_id: string }>();
  const navigate = useNavigate();

  const { createProject } = useProjectStore();

  const { llmModels, getAllProviderLLMModels } = useLLMModelStore();
  const { embeddingModels, getAllProviderEmbeddingModels } = useEmbeddingModelStore();
  const { sparseTextModels, getAllSparseTextModels } = useSparseTextModelStore();
  const { reRankerModels, getAllReRankerModels } = useReRankerModelStore();
  const { ocrModels, getAllProviderOCRModels } = useOCRModelStore();
  const { audioModels, getAllProviderAudioModels } = useAudioModelStore();
  const { videoModels, getAllProviderVideoModels } = useVideoModelStore();

  const { getAllModelCredentials } = useModelCredentialStore();

  const {
    getLLMModelProviders,
    getEmbeddingModelProviders,
    getSparseModelProviders,
    getRerankerModelProviders,
    getOCRModelProviders,
    getAudioModelProviders,
    getVideoModelProviders,
  } = useModelProviderStore();

  // ── basic info ─────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // ── locked-at-creation toggles ────────────────────────────────────────
  const [graphDbEnable, setGraphDbEnable] = useState(true);
  const [sparseEmbeddingEnable, setSparseEmbeddingEnable] = useState(true);
  const [rerankerEnable, setRerankerEnable] = useState(true);
  const [llmTagExtractionEnable, setLlmTagExtractionEnable] = useState(true);

  // ── provider option lists ─────────────────────────────────────────────
  const [llmProviders, setLlmProviders] = useState<string[]>([]);
  const [embProviders, setEmbProviders] = useState<string[]>([]);
  const [sparseProviders, setSparseProviders] = useState<string[]>([]);
  const [rerankerProviders, setRerankerProviders] = useState<string[]>([]);
  const [ocrProviders, setOcrProviders] = useState<string[]>([]);
  const [audioProviders, setAudioProviders] = useState<string[]>([]);
  const [videoProviders, setVideoProviders] = useState<string[]>([]);

  // ── LLM ────────────────────────────────────────────────────────────────
  const [llmProvider, setLlmProvider] = useState("");
  const [llmModelId, setLlmModelId] = useState("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmCredentialId, setLlmCredentialId] = useState("");
  const [llmCredentials, setLlmCredentials] = useState<{ id: string; name: string }[] | null>(null);
  const [llmCredLoading, setLlmCredLoading] = useState(false);

  // ── Embedding ──────────────────────────────────────────────────────────
  const [embProvider, setEmbProvider] = useState("");
  const [embModelId, setEmbModelId] = useState("");
  const [embLoading, setEmbLoading] = useState(false);
  const [embCredentialId, setEmbCredentialId] = useState("");
  const [embCredentials, setEmbCredentials] = useState<{ id: string; name: string }[] | null>(null);
  const [embCredLoading, setEmbCredLoading] = useState(false);

  // ── Sparse (local/cloud) ──────────────────────────────────────────────
  const [sparseType, setSparseType] = useState<ProviderType | "">("");
  const [sparseProvider, setSparseProvider] = useState("");
  const [sparseModelId, setSparseModelId] = useState("");
  const [sparseCredentialId, setSparseCredentialId] = useState("");
  const [sparseCredentials, setSparseCredentials] = useState<{ id: string; name: string }[] | null>(
    null,
  );
  const [sparseCredLoading, setSparseCredLoading] = useState(false);

  // ── Reranker (local/cloud) ────────────────────────────────────────────
  const [rerankerType, setRerankerType] = useState<ProviderType | "">("");
  const [rerankerProvider, setRerankerProvider] = useState("");
  const [rerankerModelId, setRerankerModelId] = useState("");
  const [rerankerCredentialId, setRerankerCredentialId] = useState("");
  const [rerankerCredentials, setRerankerCredentials] = useState<
    { id: string; name: string }[] | null
  >(null);
  const [rerankerCredLoading, setRerankerCredLoading] = useState(false);

  // ── OCR ────────────────────────────────────────────────────────────────
  const [ocrProvider, setOcrProvider] = useState("");
  const [ocrModelId, setOcrModelId] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrCredentialId, setOcrCredentialId] = useState("");
  const [ocrCredentials, setOcrCredentials] = useState<{ id: string; name: string }[] | null>(null);
  const [ocrCredLoading, setOcrCredLoading] = useState(false);

  // ── Audio ──────────────────────────────────────────────────────────────
  const [audioProvider, setAudioProvider] = useState("");
  const [audioModelId, setAudioModelId] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioCredentialId, setAudioCredentialId] = useState("");
  const [audioCredentials, setAudioCredentials] = useState<{ id: string; name: string }[] | null>(
    null,
  );
  const [audioCredLoading, setAudioCredLoading] = useState(false);

  // ── Video ──────────────────────────────────────────────────────────────
  const [videoProvider, setVideoProvider] = useState("");
  const [videoModelId, setVideoModelId] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoCredentialId, setVideoCredentialId] = useState("");
  const [videoCredentials, setVideoCredentials] = useState<{ id: string; name: string }[] | null>(
    null,
  );
  const [videoCredLoading, setVideoCredLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── mount: load provider lists + org-wide sparse/reranker models ───────
  useEffect(() => {
    if (!org_id) return;

    getLLMModelProviders().then((res) => setLlmProviders(res ?? []));
    getEmbeddingModelProviders().then((res) => setEmbProviders(res ?? []));
    getSparseModelProviders().then((res) => setSparseProviders(res ?? []));
    getRerankerModelProviders().then((res) => setRerankerProviders(res ?? []));
    getOCRModelProviders().then((res) => setOcrProviders(res ?? []));
    getAudioModelProviders().then((res) => setAudioProviders(res ?? []));
    getVideoModelProviders().then((res) => setVideoProviders(res ?? []));

    getAllSparseTextModels(org_id);
    getAllReRankerModels(org_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org_id]);

  // ── generic credential fetch helper ─────────────────────────────────────
  const fetchCredentials = async (
    provider: string,
    setLoading: (v: boolean) => void,
    setList: (v: { id: string; name: string }[] | null) => void,
  ) => {
    setList(null);
    if (!provider || !org_id) return;
    setLoading(true);
    await getAllModelCredentials(org_id, provider);
    const snapshot = useModelCredentialStore.getState().modelCredentials;
    setList(snapshot);
    setLoading(false);
  };

  // ── LLM handlers ─────────────────────────────────────────────────────────
  const handleLlmProvider = async (provider: string) => {
    setLlmProvider(provider);
    setLlmModelId("");
    setLlmCredentialId("");
    if (!provider || !org_id) return;

    setLlmLoading(true);
    await getAllProviderLLMModels(org_id, provider);
    setLlmLoading(false);

    fetchCredentials(provider, setLlmCredLoading, setLlmCredentials);
  };

  // ── Embedding handlers ────────────────────────────────────────────────
  const handleEmbProvider = async (provider: string) => {
    setEmbProvider(provider);
    setEmbModelId("");
    setEmbCredentialId("");
    if (!provider || !org_id) return;

    setEmbLoading(true);
    await getAllProviderEmbeddingModels(org_id, provider);
    setEmbLoading(false);

    fetchCredentials(provider, setEmbCredLoading, setEmbCredentials);
  };

  // ── Sparse handlers ──────────────────────────────────────────────────
  const handleSparseType = (t: ProviderType) => {
    setSparseType(t);
    setSparseProvider("");
    setSparseModelId("");
    setSparseCredentialId("");
    setSparseCredentials(null);
  };
  const handleSparseProvider = (provider: string) => {
    setSparseProvider(provider);
    setSparseModelId("");
    setSparseCredentialId("");
    if (sparseType === "cloud") {
      fetchCredentials(provider, setSparseCredLoading, setSparseCredentials);
    }
  };

  // ── Reranker handlers ────────────────────────────────────────────────
  const handleRerankerType = (t: ProviderType) => {
    setRerankerType(t);
    setRerankerProvider("");
    setRerankerModelId("");
    setRerankerCredentialId("");
    setRerankerCredentials(null);
  };
  const handleRerankerProvider = (provider: string) => {
    setRerankerProvider(provider);
    setRerankerModelId("");
    setRerankerCredentialId("");
    if (rerankerType === "cloud") {
      fetchCredentials(provider, setRerankerCredLoading, setRerankerCredentials);
    }
  };

  // ── OCR handlers ─────────────────────────────────────────────────────
  const handleOcrProvider = async (provider: string) => {
    setOcrProvider(provider);
    setOcrModelId("");
    setOcrCredentialId("");
    if (!provider || !org_id) return;

    setOcrLoading(true);
    await getAllProviderOCRModels(org_id, provider);
    setOcrLoading(false);

    fetchCredentials(provider, setOcrCredLoading, setOcrCredentials);
  };

  // ── Audio handlers ───────────────────────────────────────────────────
  const handleAudioProvider = async (provider: string) => {
    setAudioProvider(provider);
    setAudioModelId("");
    setAudioCredentialId("");
    if (!provider || !org_id) return;

    setAudioLoading(true);
    await getAllProviderAudioModels(org_id, provider);
    setAudioLoading(false);

    fetchCredentials(provider, setAudioCredLoading, setAudioCredentials);
  };

  // ── Video handlers ───────────────────────────────────────────────────
  const handleVideoProvider = async (provider: string) => {
    setVideoProvider(provider);
    setVideoModelId("");
    setVideoCredentialId("");
    if (!provider || !org_id) return;

    setVideoLoading(true);
    await getAllProviderVideoModels(org_id, provider);
    setVideoLoading(false);

    fetchCredentials(provider, setVideoCredLoading, setVideoCredentials);
  };

  // ── client-side filtered sparse/reranker model lists ────────────────────
  const filteredSparseModels = useMemo(() => {
    return (sparseTextModels ?? []).filter(
      (m: any) =>
        (!sparseType || m.provider_type === sparseType) &&
        (!sparseProvider || m.provider === sparseProvider),
    );
  }, [sparseTextModels, sparseType, sparseProvider]);

  const filteredRerankerModels = useMemo(() => {
    return (reRankerModels ?? []).filter(
      (m: any) =>
        (!rerankerType || m.provider_type === rerankerType) &&
        (!rerankerProvider || m.provider === rerankerProvider),
    );
  }, [reRankerModels, rerankerType, rerankerProvider]);

  // ── validation ────────────────────────────────────────────────────────
  const isValid = useMemo(() => {
    if (!name.trim() || !description.trim()) return false;
    if (!llmModelId || !llmCredentialId) return false;
    if (!embModelId || !embCredentialId) return false;
    if (sparseEmbeddingEnable) {
      if (!sparseModelId) return false;
      if (sparseType === "cloud" && !sparseCredentialId) return false;
    }
    if (rerankerEnable) {
      if (!rerankerModelId) return false;
      if (rerankerType === "cloud" && !rerankerCredentialId) return false;
    }
    return true;
  }, [
    name,
    description,
    llmModelId,
    llmCredentialId,
    embModelId,
    embCredentialId,
    sparseEmbeddingEnable,
    sparseModelId,
    sparseType,
    sparseCredentialId,
    rerankerEnable,
    rerankerModelId,
    rerankerType,
    rerankerCredentialId,
  ]);

  // ── submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!org_id) return;
    if (!isValid) {
      setFormError("Fill in all required fields before creating the project.");
      return;
    }
    setFormError(null);
    setSubmitting(true);

    const payload: CreateProjectPayload = {
      org_id,
      name: name.trim(),
      description: description.trim(),
      project_metadata: {},
      config: {
        graph_db_enable: graphDbEnable,
        sparse_embedding_enable: sparseEmbeddingEnable,
        reranker_enable: rerankerEnable,
        llm_tag_extraction_enable: llmTagExtractionEnable,

        llm_model_id: llmModelId,
        llm_model_credential_id: llmCredentialId,

        embedding_model_id: embModelId,
        embedding_model_credential_id: embCredentialId,

        sparse_text_model_id: sparseEmbeddingEnable ? sparseModelId || null : null,
        sparse_text_model_credential_id:
          sparseEmbeddingEnable && sparseType === "cloud" ? sparseCredentialId || null : null,

        reranker_model_id: rerankerEnable ? rerankerModelId || null : null,
        reranker_model_credential_id:
          rerankerEnable && rerankerType === "cloud" ? rerankerCredentialId || null : null,

        ocr_model_id: ocrModelId || null,
        ocr_model_credential_id: ocrModelId ? ocrCredentialId || null : null,

        audio_model_id: audioModelId || null,
        audio_model_credential_id: audioModelId ? audioCredentialId || null : null,

        video_model_id: videoModelId || null,
        video_model_credential_id: videoModelId ? videoCredentialId || null : null,
      },
    };

    try {
      await createProject(org_id, payload as any);
      navigate(`/organizations/${org_id}/projects`);
    } catch (error) {
      console.error(error);
      setFormError("Something went wrong while creating the project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-6">
      <div className="max-w-[1200px] mx-auto space-y-3">
        <div className="mb-5">
          <h1 className="text-lg font-medium text-black dark:text-white">Create project</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Configure your retrieval pipeline below.</p>
        </div>

        {/* Basic info */}
        <div className={CARD}>
          <SectionHeading dot="bg-zinc-600" title="Basic info" />
          <div className="space-y-2">
            <div>
              <label className={LABEL}>Project name</label>
              <input
                className={INPUT}
                placeholder="e.g. Customer Support Bot"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Description</label>
              <input
                className={INPUT}
                placeholder="What is this project for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Locked-at-creation toggles */}
        <div className={CARD}>
          <SectionHeading dot="bg-red-500" title="Pipeline settings" />
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <Toggle
              checked={graphDbEnable}
              onChange={setGraphDbEnable}
              label="Graph database"
              description="Build a knowledge graph alongside vector storage for this project."
            />
            {!graphDbEnable && (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-yellow-700">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                <p className="text-sm font-medium">
                  Warning: Graph Database cannot be enabled after the project is created.
                </p>
              </div>
            )}
            <Toggle
              checked={sparseEmbeddingEnable}
              onChange={(v) => {
                setSparseEmbeddingEnable(v);
                if (!v) {
                  setSparseType("");
                  setSparseProvider("");
                  setSparseModelId("");
                  setSparseCredentialId("");
                }
              }}
              label="Sparse embeddings"
              description="Enable keyword-style sparse vectors alongside dense embeddings."
            />
            {!sparseEmbeddingEnable && (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-yellow-700">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                <p className="text-sm font-medium">
                  Warning: Sparse Embeddings cannot be enabled after the project is created.
                </p>
              </div>
            )}
            <Toggle
              checked={rerankerEnable}
              onChange={(v) => {
                setRerankerEnable(v);
                if (!v) {
                  setRerankerType("");
                  setRerankerProvider("");
                  setRerankerModelId("");
                  setRerankerCredentialId("");
                }
              }}
              label="Reranker"
              description="Re-score retrieved results with a dedicated reranking model."
            />
            <Toggle
              checked={llmTagExtractionEnable}
              onChange={setLlmTagExtractionEnable}
              label="LLM tag extraction"
              description="Use the project's LLM to auto-tag ingested content."
            />
          </div>
          <LockNote>
            Graph database and sparse embeddings can only be set now — they can't be enabled or
            disabled after the project is created.
          </LockNote>
        </div>

        {/* LLM model */}
        <div className={CARD}>
          <SectionHeading dot="bg-violet-500" title="LLM model" />
          <ProviderRow
            providers={llmProviders}
            providerValue={llmProvider}
            onProviderChange={handleLlmProvider}
            modelOptions={llmModels}
            modelValue={llmModelId}
            onModelChange={setLlmModelId}
            loading={llmLoading}
          />
          {llmProvider && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className={LABEL}>Credential</label>
                <CredentialSelect
                  provider={llmProvider}
                  credentials={llmCredentials}
                  value={llmCredentialId}
                  onChange={setLlmCredentialId}
                  loading={llmCredLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Embedding model */}
        <div className={CARD}>
          <SectionHeading dot="bg-sky-500" title="Embedding model" />
          <ProviderRow
            providers={embProviders}
            providerValue={embProvider}
            onProviderChange={handleEmbProvider}
            modelOptions={embeddingModels}
            modelValue={embModelId}
            onModelChange={setEmbModelId}
            loading={embLoading}
          />
          {embProvider && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className={LABEL}>Credential</label>
                <CredentialSelect
                  provider={embProvider}
                  credentials={embCredentials}
                  value={embCredentialId}
                  onChange={setEmbCredentialId}
                  loading={embCredLoading}
                />
              </div>
            </div>
          )}
          <div className="mt-2 flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-1 text-yellow-700">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
            <p className="text-sm font-medium">
              Note: The embedding model can't be changed once the project is created.
            </p>
          </div>
        </div>

        {/* Sparse model */}
        {sparseEmbeddingEnable && (
          <div className={CARD}>
            <SectionHeading dot="bg-emerald-500" title="Sparse text model" />
            <LocalCloudProviderRow
              providerType={sparseType}
              onProviderTypeChange={handleSparseType}
              providers={sparseProviders}
              providerValue={sparseProvider}
              onProviderChange={handleSparseProvider}
              modelOptions={filteredSparseModels}
              modelValue={sparseModelId}
              onModelChange={setSparseModelId}
              loading={false}
            />
            {sparseType === "cloud" && sparseProvider && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className={LABEL}>Credential</label>
                  <CredentialSelect
                    provider={sparseProvider}
                    credentials={sparseCredentials}
                    value={sparseCredentialId}
                    onChange={setSparseCredentialId}
                    loading={sparseCredLoading}
                  />
                </div>
              </div>
            )}
            {sparseType === "local" && (
              <p className="text-[11px] text-zinc-500 mt-2">
                Local models run in-cluster — no credential needed.
              </p>
            )}
          </div>
        )}

        {/* Reranker model */}
        {rerankerEnable && (
          <div className={CARD}>
            <SectionHeading dot="bg-amber-500" title="Reranker model" />
            <LocalCloudProviderRow
              providerType={rerankerType}
              onProviderTypeChange={handleRerankerType}
              providers={rerankerProviders}
              providerValue={rerankerProvider}
              onProviderChange={handleRerankerProvider}
              modelOptions={filteredRerankerModels}
              modelValue={rerankerModelId}
              onModelChange={setRerankerModelId}
              loading={false}
            />
            {rerankerType === "cloud" && rerankerProvider && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className={LABEL}>Credential</label>
                  <CredentialSelect
                    provider={rerankerProvider}
                    credentials={rerankerCredentials}
                    value={rerankerCredentialId}
                    onChange={setRerankerCredentialId}
                    loading={rerankerCredLoading}
                  />
                </div>
              </div>
            )}
            {rerankerType === "local" && (
              <p className="text-[11px] text-zinc-500 mt-2">
                Local models run in-cluster — no credential needed.
              </p>
            )}
          </div>
        )}

        {/* OCR model */}
        <div className={CARD}>
          <SectionHeading dot="bg-fuchsia-500" title="OCR model" optional />
          <ProviderRow
            providers={ocrProviders}
            providerValue={ocrProvider}
            onProviderChange={handleOcrProvider}
            modelOptions={ocrModels}
            modelValue={ocrModelId}
            onModelChange={setOcrModelId}
            loading={ocrLoading}
          />
          {ocrProvider && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className={LABEL}>Credential</label>
                <CredentialSelect
                  provider={ocrProvider}
                  credentials={ocrCredentials}
                  value={ocrCredentialId}
                  onChange={setOcrCredentialId}
                  loading={ocrCredLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Audio model */}
        <div className={CARD}>
          <SectionHeading dot="bg-cyan-500" title="Audio model" optional />
          <ProviderRow
            providers={audioProviders}
            providerValue={audioProvider}
            onProviderChange={handleAudioProvider}
            modelOptions={audioModels}
            modelValue={audioModelId}
            onModelChange={setAudioModelId}
            loading={audioLoading}
          />
          {audioProvider && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className={LABEL}>Credential</label>
                <CredentialSelect
                  provider={audioProvider}
                  credentials={audioCredentials}
                  value={audioCredentialId}
                  onChange={setAudioCredentialId}
                  loading={audioCredLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Video model */}
        <div className={CARD}>
          <SectionHeading dot="bg-orange-500" title="Video model" optional />
          <ProviderRow
            providers={videoProviders}
            providerValue={videoProvider}
            onProviderChange={handleVideoProvider}
            modelOptions={videoModels}
            modelValue={videoModelId}
            onModelChange={setVideoModelId}
            loading={videoLoading}
          />
          {videoProvider && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className={LABEL}>Credential</label>
                <CredentialSelect
                  provider={videoProvider}
                  credentials={videoCredentials}
                  value={videoCredentialId}
                  onChange={setVideoCredentialId}
                  loading={videoCredLoading}
                />
              </div>
            </div>
          )}
        </div>

        {formError && (
          <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {formError}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-11 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting ? "Creating…" : "Create project"}
        </button>
      </div>
    </div>
  );
}
