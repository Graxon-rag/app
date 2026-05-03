import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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

  // Load providers
  useEffect(() => {
    const loadProviders = async () => {
      const data = await getLLMModelProviders();
      setProviders(data || []);
    };
    loadProviders();
  }, []);

  // Fetch models when provider changes
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
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          <Plus size={14} />
          Add Model
        </button>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {llmModels.map((model: LLMModelInterface) => (
          <div
            key={model.id}
            className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-3"
          >
            {/* Header */}
            <div className="flex justify-between">
              <div>
                <h2 className="font-medium">{model.name}</h2>
                <p className="text-xs text-zinc-400">{model.model_id}</p>
              </div>

              <button onClick={() => setConfirmDelete(model.id)} className="text-red-500">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Info */}
            <div className="text-sm text-zinc-500 space-y-1">
              <p>
                <b>Provider:</b> {model.provider}
              </p>
              <p>
                <b>Model:</b> {model.model_name}
              </p>
            </div>

            <p className="text-sm text-zinc-500">{model.description}</p>

            {/* DELETE CONFIRM STEP 1 */}
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

      {/* MODAL */}
      <CreateLLMModelModal open={open} onClose={() => setOpen(false)} provider={provider} />
    </div>
  );
}

export default LLMModelIndex;
