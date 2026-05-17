import React, { useEffect, useState } from "react";
import { Plus, Trash2, Boxes, Sparkles } from "lucide-react";
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

  useEffect(() => {
    const load = async () => {
      const data = await getEmbeddingModelProviders();
      setProviders(data || []);
    };
    load();
  }, []);

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

  const isEmpty = !embeddingModels || embeddingModels.length === 0;

  return (
    <div className="space-y-6 max-w-[1450px] mx-auto">
      {/* HEADER */}
      <h1 className="text-xl font-semibold">Embedding Models</h1>

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
            <Boxes className="w-8 h-8 text-primary-500" />
          </div>

          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
            No embedding models for this provider yet
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
            Be the first to add an embedding model under{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{provider}</span>. Power
            semantic search and vector retrieval across your pipelines.
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
          {embeddingModels.map((model: EmbeddingModelInterface) => (
            <div
              key={model.id}
              className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-3"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="font-medium">{model.name}</h2>
                  <p className="text-xs text-zinc-400">{model.model_id}</p>
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
                  <b>Model:</b> {model.model_name}
                </p>
                <p>
                  <b>Dimension:</b> {model.dimension}
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
      <CreateEmbeddingModelModal open={open} onClose={() => setOpen(false)} provider={provider} />
    </div>
  );
}

export default EmbeddingModelIndex;
