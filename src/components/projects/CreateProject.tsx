import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useLLMModelStore } from "@/store/llmModelStore";
import { useEmbeddingModelStore } from "@/store/embeddingModelStore";
import { useSparseTextModelStore } from "@/store/sparseTextModelStore";
import { useReRankerModelStore } from "@/store/reRankerModelStore";
import { useModelCredentialStore } from "@/store/modelCredentialStore";
import { useProjectStore } from "@/store/projectStore";
import type { CreateProjectInterface } from "@/interfaces/ProjectInterface";

// ─── primitives ───────────────────────────────────────────────────────────────
const LABEL = "block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-1.5";
const INPUT =
  "w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors";
const SELECT = INPUT + " appearance-none cursor-pointer";
const CARD = "rounded-xl border border-zinc-800 bg-[#111113] p-4";

function SectionHeading({ dot, title, pill }: { dot: string; title: string; pill?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="text-xs font-medium text-zinc-400">{title}</span>
      {pill && (
        <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-950 text-zinc-600">
          {pill}
        </span>
      )}
    </div>
  );
}

function Ghost({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-9 px-3 flex items-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-600 text-sm select-none">
      {children}
    </div>
  );
}

function ProviderRow({
  providers,
  onProviderChange,
  modelOptions,
  modelValue,
  onModelChange,
  loading,
  modelLabel = "Model",
}: {
  providers: string[];
  onProviderChange: (p: string) => void;
  modelOptions: { id: string; name: string }[] | null;
  modelValue: string;
  onModelChange: (id: string) => void;
  loading: boolean;
  modelLabel?: string;
}) {
  const options = modelOptions ?? [];

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className={LABEL}>Provider</label>
        <select
          className={SELECT}
          defaultValue=""
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
        {loading ? (
          <Ghost>fetching…</Ghost>
        ) : options.length === 0 ? (
          <Ghost>choose provider first</Ghost>
        ) : (
          <select
            className={SELECT}
            value={modelValue}
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

// ─── LLM providers — hardcoded to match your store's fallback ────────────────
const LLM_PROVIDERS = ["openai", "gemini", "claude", "deepseek"];
const EMB_PROVIDERS = ["openai", "gemini", "voyage"];

// ─── page ─────────────────────────────────────────────────────────────────────
export default function CreateProjectIndex() {
  const { org_id } = useParams<{ org_id: string }>();

  const { createProject } = useProjectStore();
  const { llmModels, getAllProviderLLMModels } = useLLMModelStore();
  const { embeddingModels, getAllProviderEmbeddingModels } = useEmbeddingModelStore();
  const { sparseTextModels, getAllSparseTextModels } = useSparseTextModelStore();
  const { reRankerModels, getAllReRankerModels } = useReRankerModelStore();
  const { modelCredentials, getAllModelCredentials } = useModelCredentialStore();

  const [form, setForm] = useState<CreateProjectInterface>({
    org_id: org_id ?? "",
    name: "",
    description: "",
    llm_model_id: "",
    embedding_model_id: "",
    sparse_text_model_id: "",
    reranker_model_id: "",
    llm_model_credential_id: "",
    embedding_model_credential_id: "",
  });

  const patch = (partial: Partial<CreateProjectInterface>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const [llmLoading, setLlmLoading] = useState(false);
  const [embLoading, setEmbLoading] = useState(false);
  const [credLoading, setCredLoading] = useState(false);

  useEffect(() => {
    if (!org_id) return;
    getAllSparseTextModels(org_id);
    getAllReRankerModels(org_id);
  }, [org_id]);

  const handleLLMProvider = async (provider: string) => {
    patch({ llm_model_id: "" });
    if (!provider) return;
    setLlmLoading(true);
    await getAllProviderLLMModels(org_id!, provider);
    setLlmLoading(false);
  };

  const handleEmbProvider = async (provider: string) => {
    patch({ embedding_model_id: "" });
    if (!provider) return;
    setEmbLoading(true);
    await getAllProviderEmbeddingModels(org_id!, provider);
    setEmbLoading(false);
  };

  const handleCredProvider = async (provider: string) => {
    patch({ llm_model_credential_id: "", embedding_model_credential_id: "" });
    if (!provider) return;
    setCredLoading(true);
    await getAllModelCredentials(org_id!, provider);
    setCredLoading(false);
  };

  // null-safe helpers — stores initialize to null, not []
  const safeSparse = sparseTextModels ?? [];
  const safeRerankers = reRankerModels ?? [];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto space-y-3">
        <div className="mb-5">
          <h1 className="text-lg font-medium text-white">Create project</h1>
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
                onChange={(e) => patch({ name: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL}>Description</label>
              <input
                className={INPUT}
                placeholder="What is this project for?"
                onChange={(e) => patch({ description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* LLM */}
        <div className={CARD}>
          <SectionHeading dot="bg-violet-500" title="LLM model" />
          <ProviderRow
            providers={LLM_PROVIDERS}
            onProviderChange={handleLLMProvider}
            modelOptions={llmModels}
            modelValue={form.llm_model_id}
            onModelChange={(id) => patch({ llm_model_id: id })}
            loading={llmLoading}
          />
        </div>

        {/* Embedding */}
        <div className={CARD}>
          <SectionHeading dot="bg-sky-500" title="Embedding model" />
          <ProviderRow
            providers={EMB_PROVIDERS}
            onProviderChange={handleEmbProvider}
            modelOptions={embeddingModels}
            modelValue={form.embedding_model_id}
            onModelChange={(id) => patch({ embedding_model_id: id })}
            loading={embLoading}
          />
        </div>

        {/* Sparse */}
        <div className={CARD}>
          <SectionHeading dot="bg-emerald-500" title="Sparse model" pill="loaded on mount" />
          <label className={LABEL}>Select model</label>
          {safeSparse.length === 0 ? (
            <Ghost>loading…</Ghost>
          ) : (
            <select
              className={SELECT}
              value={form.sparse_text_model_id}
              onChange={(e) => patch({ sparse_text_model_id: e.target.value })}
            >
              <option value="">Select model</option>
              {safeSparse.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Reranker */}
        <div className={CARD}>
          <SectionHeading dot="bg-amber-500" title="Reranker model" pill="loaded on mount" />
          <label className={LABEL}>Select model</label>
          {safeRerankers.length === 0 ? (
            <Ghost>loading…</Ghost>
          ) : (
            <select
              className={SELECT}
              value={form.reranker_model_id}
              onChange={(e) => patch({ reranker_model_id: e.target.value })}
            >
              <option value="">Select model</option>
              {safeRerankers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Credentials */}
        <div className={CARD}>
          <SectionHeading dot="bg-rose-500" title="Credentials" />
          <ProviderRow
            providers={[...new Set([...LLM_PROVIDERS, ...EMB_PROVIDERS])]}
            onProviderChange={handleCredProvider}
            modelOptions={modelCredentials}
            modelValue={form.llm_model_credential_id}
            onModelChange={(id) =>
              patch({ llm_model_credential_id: id, embedding_model_credential_id: id })
            }
            loading={credLoading}
            modelLabel="Credential"
          />
        </div>

        <button
          onClick={() => createProject(form.org_id, form)}
          className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium hover:opacity-85 active:scale-[0.98] transition-all"
        >
          Create project
        </button>
      </div>
    </div>
  );
}
