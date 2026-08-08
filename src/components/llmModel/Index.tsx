import React, { useEffect, useState } from "react";
import { Plus, Trash2, BotMessageSquare, Sparkles } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useLLMModelStore } from "@/store/llmModelStore";
import { useModelProviderStore } from "@/store/modelProviderStore";
import CreateLLMModelModal from "@/components/llmModel/CreateLLMModelModal";
import { LLMModelInterface } from "@/interfaces/LLMModelInterface";

function LLMModelIndex() {
  const { org_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const provider = searchParams.get("provider") || "openai";

  const { getLLMModelProviders } = useModelProviderStore();
  const { llmModels, getAllProviderLLMModels, deleteLLMModel } = useLLMModelStore();

  const [providers, setProviders] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [doubleConfirm, setDoubleConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      const data = await getLLMModelProviders();
      setProviders(data || []);
    };
    loadProviders();
  }, []);

  useEffect(() => {
    if (org_id && provider) {
      getAllProviderLLMModels(org_id, provider);
    }
  }, [org_id, provider]);

  const handleProviderChange = (value: string) => {
    setSearchParams({ provider: value });
  };

  const handleDelete = async (id: string) => {
    if (!org_id) return;
    if (doubleConfirm !== id) {
      setDoubleConfirm(id);
      return;
    }
    await deleteLLMModel(org_id, provider, id);
    setConfirmDelete(null);
    setDoubleConfirm(null);
  };

  const isEmpty = !llmModels || llmModels.length === 0;

  return (
    <div className="space-y-6 max-w-[1450px] mx-auto">
      {/* HEADER */}
      <h1 className="text-xl font-semibold">LLM Models</h1>

      <div className="flex items-center justify-between">
        {/* Provider Select */}
        <select
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="h-9 px-3 rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800"
        >
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Create Button */}
        <button
          onClick={() => setOpen(true)}
          disabled={!provider}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Plus size={14} />
          Add Model
        </button>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 mb-5">
            <BotMessageSquare className="w-8 h-8 text-primary-500" />
          </div>

          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
            No models for this provider yet
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
            Be the first to add an LLM model under{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{provider}</span>.
            Configure it once and use it across your pipelines.
          </p>

          <button
            onClick={() => setOpen(true)}
            disabled={!provider}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition"
          >
            <Sparkles size={14} />
            Add your first model
          </button>
        </div>
      ) : (
        /* GRID */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {llmModels.map((model: LLMModelInterface) => (
            <div
              key={model.id}
              className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-3"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xs mb-2">ID: {model.id}</h2>
                  <h2 className="font-medium">{model.name}</h2>
                  <p className="text-xs font-mono mt-1">Model ID : {model.model_id}</p>
                </div>

                <button onClick={() => setConfirmDelete(model.id)} className="text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="text-sm text-zinc-500 space-y-1">
                <p>
                  <b>Provider:</b> {model.provider}
                </p>
                <p>
                  <b>Model Name:</b> {model.model_name}
                </p>
              </div>

              <p className="text-sm text-zinc-500">{model.description}</p>

              {confirmDelete === model.id && (
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setConfirmDelete(null)} className="text-sm text-zinc-500">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(model.id)} className="text-sm text-red-500">
                    {doubleConfirm === model.id ? "Click again to confirm" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <CreateLLMModelModal open={open} onClose={() => setOpen(false)} provider={provider} />
    </div>
  );
}

export default LLMModelIndex;
