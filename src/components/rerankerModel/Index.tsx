import React, { useEffect, useState } from "react";
import { Plus, Trash2, ListFilter, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { useReRankerModelStore } from "@/store/reRankerModelStore";
import CreateReRankerModelModal from "@/components/rerankerModel/CreateReRankerModelModal";
import { ReRankerModelInterface } from "@/interfaces/ReRankerModelInterface";

function ReRankerModelIndex() {
  const { org_id } = useParams();

  const { reRankerModels, getAllReRankerModels, deleteReRankerModel } = useReRankerModelStore();

  const [open, setOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (org_id) {
      getAllReRankerModels(org_id);
    }
  }, [org_id]);

  const handleDelete = async (id: string) => {
    if (!org_id) return;
    await deleteReRankerModel(org_id, id);
    setConfirmDeleteId(null);
  };

  const isEmpty = !reRankerModels || reRankerModels.length === 0;

  return (
    <div className="space-y-6 max-w-[1450px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Re Ranker Models</h1>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          <Plus size={14} />
          Add Model
        </button>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 mb-5">
            <ListFilter className="w-8 h-8 text-primary-500" />
          </div>

          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
            No re-ranker models yet
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
            Be the first to add a re-ranker model. Improve search relevance by ranking results with
            precision.
          </p>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition"
          >
            <Sparkles size={14} />
            Add your first model
          </button>
        </div>
      ) : (
        /* Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reRankerModels.map((model: ReRankerModelInterface) => (
            <div
              key={model.id}
              className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-medium">{model.name}</h2>
                  <p className="text-xs text-zinc-400 font-mono">ID: {model.id}</p>
                </div>

                <button
                  onClick={() => setConfirmDeleteId(model.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-1 text-sm text-zinc-500">
                <p>
                  <b>Provider:</b> {model.provider}
                </p>
                <p>
                  <b>Model:</b> {model.model}
                </p>
                <p>
                  <b>Size:</b> {model.size_in_gb} GB
                </p>
              </div>

              <p className="text-sm text-zinc-500">{model.description}</p>

              {confirmDeleteId === model.id && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-sm text-zinc-500"
                  >
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(model.id)} className="text-sm text-red-500">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateReRankerModelModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default ReRankerModelIndex;
