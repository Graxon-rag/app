import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useModelProviderStore } from "@/store/modelProviderStore";
import { useEmbeddingModelStore } from "@/store/embeddingModelStore";
import CreateEmbeddingModelModal from "@/components/embeddingModel/CreateEmbeddingModelModal";
import { EmbeddingModelInterface } from "@/interfaces/EmbeddingModelInterface";

function EmbeddingModelIndex() {
  const { org_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const provider = searchParams.get("provider") || "openai";

  const { getEmbeddingModelProviders } = useModelProviderStore();
  const { embeddingModels, getAllProviderEmbeddingModels, deleteEmbeddingModel } =
    useEmbeddingModelStore();

  const [providers, setProviders] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [doubleConfirm, setDoubleConfirm] = useState<string | null>(null);

  // Load providers
  useEffect(() => {
    const load = async () => {
      const data = await getEmbeddingModelProviders();
      setProviders(data || []);
    };
    load();
  }, []);

  // Fetch models by provider
  useEffect(() => {
    if (org_id && provider) {
      getAllProviderEmbeddingModels(org_id, provider);
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

    await deleteEmbeddingModel(org_id, provider, id);
    setConfirmDelete(null);
    setDoubleConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
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

        {/* Create */}
        <button
          onClick={() => setOpen(true)}
          disabled={!provider}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
        >
          <Plus size={14} />
          New Embedding Model
        </button>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {embeddingModels.map((model: EmbeddingModelInterface) => (
          <div
            key={model.id}
            className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-3"
          >
            {/* HEADER */}
            <div className="flex justify-between">
              <div>
                <h2 className="font-medium">{model.name}</h2>
                <p className="text-xs text-zinc-400">{model.model_id}</p>
              </div>

              <button onClick={() => setConfirmDelete(model.id)} className="text-red-500">
                <Trash2 size={16} />
              </button>
            </div>

            {/* INFO */}
            <div className="text-sm text-zinc-500 space-y-1">
              <p>
                <b>Provider:</b> {model.provider}
              </p>
              <p>
                <b>Model:</b> {model.model_name}
              </p>
              <p>
                <b>Dimension:</b> {model.dimension}
              </p>
            </div>

            <p className="text-sm text-zinc-500">{model.description}</p>

            {/* DELETE CONFIRM */}
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
      <CreateEmbeddingModelModal open={open} onClose={() => setOpen(false)} provider={provider} />
    </div>
  );
}

export default EmbeddingModelIndex;
