import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLLMModelStore } from "@/store/llmModelStore";
import { useEmbeddingModelStore } from "@/store/embeddingModelStore";
import { useSparseTextModelStore } from "@/store/sparseTextModelStore";
import { useReRankerModelStore } from "@/store/reRankerModelStore";
import { useModelCredentialStore } from "@/store/modelCredentialStore";
import { useModelProviderStore } from "@/store/modelProviderStore";
import { useProjectStore } from "@/store/projectStore";
import type { CreateProjectInterface } from "@/interfaces/ProjectInterface";

// ─── primitives ───────────────────────────────────────────────────────────────
const LABEL =
  "block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5";

const INPUT =
  "w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors";

const SELECT = INPUT + " appearance-none cursor-pointer";

const CARD =
  "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm";

// ─── components ───────────────────────────────────────────────────────────────
function SectionHeading({ dot, title, pill }: { dot: string; title: string; pill?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="text-xs font-medium text-zinc-400">{title}</span>
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

function ProviderRow({
  providers,
  providerValue,
  onProviderChange,
  modelOptions,
  modelValue,
  onModelChange,
  loading,
  modelLabel = "Model",
}: {
  providers: string[];
  providerValue: string;
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

// ─── page ─────────────────────────────────────────────────────────────────────
export default function CreateProjectIndex() {
  const { org_id } = useParams<{ org_id: string }>();

  const { createProject } = useProjectStore();
  const { llmModels, getAllProviderLLMModels } = useLLMModelStore();
  const { embeddingModels, getAllProviderEmbeddingModels } = useEmbeddingModelStore();
  const { sparseTextModels, getAllSparseTextModels } = useSparseTextModelStore();
  const { reRankerModels, getAllReRankerModels } = useReRankerModelStore();
  const { getAllModelCredentials } = useModelCredentialStore();
  const { getLLMModelProviders, getEmbeddingModelProviders } = useModelProviderStore();

  const navigate = useNavigate();

  // ── form ──────────────────────────────────────────────────────────────────
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

  // ── providers from API ────────────────────────────────────────────────────
  const [llmProviders, setLlmProviders] = useState<string[]>([]);
  const [embProviders, setEmbProviders] = useState<string[]>([]);

  // ── controlled provider selections ───────────────────────────────────────
  const [llmProvider, setLlmProvider] = useState("");
  const [embProvider, setEmbProvider] = useState("");
  const [llmCredProvider, setLlmCredProvider] = useState("");
  const [embCredProvider, setEmbCredProvider] = useState("");

  // ── model loading flags ───────────────────────────────────────────────────
  const [llmLoading, setLlmLoading] = useState(false);
  const [embLoading, setEmbLoading] = useState(false);

  // ── credential local state (independent per picker) ───────────────────────
  const [llmCredentials, setLlmCredentials] = useState<{ id: string; name: string }[] | null>(null);
  const [embCredentials, setEmbCredentials] = useState<{ id: string; name: string }[] | null>(null);
  const [llmCredLoading, setLlmCredLoading] = useState(false);
  const [embCredLoading, setEmbCredLoading] = useState(false);

  // ── mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!org_id) return;

    getAllSparseTextModels(org_id);
    getAllReRankerModels(org_id);

    getLLMModelProviders().then((res) => setLlmProviders(res ?? []));
    getEmbeddingModelProviders().then((res) => setEmbProviders(res ?? []));
  }, [org_id]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleLLMProvider = async (provider: string) => {
    setLlmProvider(provider);
    patch({ llm_model_id: "" });
    if (!provider) return;
    setLlmLoading(true);
    await getAllProviderLLMModels(org_id!, provider);
    setLlmLoading(false);
  };

  const handleEmbProvider = async (provider: string) => {
    setEmbProvider(provider);
    patch({ embedding_model_id: "" });
    if (!provider) return;
    setEmbLoading(true);
    await getAllProviderEmbeddingModels(org_id!, provider);
    setEmbLoading(false);
  };

  const handleLLMCredProvider = async (provider: string) => {
    setLlmCredProvider(provider);
    patch({ llm_model_credential_id: "" });
    setLlmCredentials(null);
    if (!provider) return;
    setLlmCredLoading(true);
    await getAllModelCredentials(org_id!, provider);
    // store has been set — snapshot it into local state immediately
    const snapshot = useModelCredentialStore.getState().modelCredentials;
    setLlmCredentials(snapshot);
    setLlmCredLoading(false);
  };

  const handleEmbCredProvider = async (provider: string) => {
    setEmbCredProvider(provider);
    patch({ embedding_model_credential_id: "" });
    setEmbCredentials(null);
    if (!provider) return;
    setEmbCredLoading(true);
    await getAllModelCredentials(org_id!, provider);
    const snapshot = useModelCredentialStore.getState().modelCredentials;
    setEmbCredentials(snapshot);
    setEmbCredLoading(false);
  };

  // ── null-safe store values ────────────────────────────────────────────────
  const safeSparse = sparseTextModels ?? [];
  const safeRerankers = reRankerModels ?? [];

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-6">
      <div className="max-w-[1200px] mx-auto space-y-3">
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

        {/* LLM model */}
        <div className={CARD}>
          <SectionHeading dot="bg-violet-500" title="LLM model" />
          <ProviderRow
            providers={llmProviders}
            providerValue={llmProvider}
            onProviderChange={handleLLMProvider}
            modelOptions={llmModels}
            modelValue={form.llm_model_id}
            onModelChange={(id) => patch({ llm_model_id: id })}
            loading={llmLoading}
          />
        </div>

        {/* Embedding model */}
        <div className={CARD}>
          <SectionHeading dot="bg-sky-500" title="Embedding model" />
          <ProviderRow
            providers={embProviders}
            providerValue={embProvider}
            onProviderChange={handleEmbProvider}
            modelOptions={embeddingModels}
            modelValue={form.embedding_model_id}
            onModelChange={(id) => patch({ embedding_model_id: id })}
            loading={embLoading}
          />
        </div>

        {/* Sparse model */}
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

        {/* Reranker model */}
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

          {/* LLM credential */}
          <div className="mb-4">
            <p className="text-xs text-zinc-500 mb-2">LLM credential</p>
            <ProviderRow
              providers={llmProviders}
              providerValue={llmCredProvider}
              onProviderChange={handleLLMCredProvider}
              modelOptions={llmCredentials}
              modelValue={form.llm_model_credential_id}
              onModelChange={(id) => patch({ llm_model_credential_id: id })}
              loading={llmCredLoading}
              modelLabel="Credential"
            />
          </div>

          <div className="border-t border-zinc-800 my-3" />

          {/* Embedding credential */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">Embedding credential</p>
            <ProviderRow
              providers={embProviders}
              providerValue={embCredProvider}
              onProviderChange={handleEmbCredProvider}
              modelOptions={embCredentials}
              modelValue={form.embedding_model_credential_id}
              onModelChange={(id) => patch({ embedding_model_credential_id: id })}
              loading={embCredLoading}
              modelLabel="Credential"
            />
          </div>
        </div>

        <button
          onClick={async () => {
            try {
              await createProject(form.org_id, form);
              navigate(`/organizations/${form.org_id}/projects`);
            } catch (error) {
              console.error(error);
            }
          }}
          className="w-full h-11 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Create project
        </button>
      </div>
    </div>
  );
}
