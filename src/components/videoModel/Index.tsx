import { useEffect, useState } from "react";
import { Plus, Trash2, Video, Sparkles } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useVideoModelStore } from "@/store/videoModelStore";
import { useModelProviderStore } from "@/store/modelProviderStore";
import CreateVideoModelModal from "@/components/videoModel/CreateVideoModelModal";
import { VideoModelInterface } from "@/interfaces/VideoModelInterface";

function VideoModelIndex() {
  const { org_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const provider = searchParams.get("provider") || "twelvelabs";

  const { getVideoModelProviders } = useModelProviderStore();
  const { videoModels, getAllProviderVideoModels, deleteVideoModel } = useVideoModelStore();

  const [providers, setProviders] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [doubleConfirm, setDoubleConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      const data = await getVideoModelProviders();
      setProviders(data || []);
    };
    loadProviders();
  }, []);

  useEffect(() => {
    if (org_id && provider) {
      getAllProviderVideoModels(org_id, provider);
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
    await deleteVideoModel(org_id, provider, id);
    setConfirmDelete(null);
    setDoubleConfirm(null);
  };

  const isEmpty = !videoModels || videoModels.length === 0;

  return (
    <div className="space-y-6 max-w-[95%] mx-auto">
      {/* HEADER */}
      <h1 className="text-xl font-semibold">Video Models</h1>

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
            <Video className="w-8 h-8 text-primary-500" />
          </div>

          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
            No models for this provider yet
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
            Be the first to add an Video model under{" "}
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
          {videoModels.map((model: VideoModelInterface) => (
            <div
              key={model.id}
              className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-3"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xs mb-2">ID: {model.id}</h2>
                  <h2 className="font-medium">{model.name}</h2>
                  <p className="text-sm text-zinc-400">Model ID: {model.model_id}</p>
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

              <div className="text-sm text-zinc-500 space-y-1">
                <b>Metadata: </b>{" "}
                {model.model_metadata ? JSON.stringify(model.model_metadata, null, 4) : "N/A"}
              </div>

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
      <CreateVideoModelModal open={open} onClose={() => setOpen(false)} provider={provider} />
    </div>
  );
}

export default VideoModelIndex;
