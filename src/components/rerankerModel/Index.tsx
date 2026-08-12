import { useEffect, useState } from "react";
import { Plus, Trash2, ListFilter, Sparkles } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useReRankerModelStore } from "@/store/reRankerModelStore";
import CreateReRankerModelModal from "@/components/rerankerModel/CreateReRankerModelModal";
import { ReRankerModelInterface } from "@/interfaces/ReRankerModelInterface";
import { RerankerModelProviderTypeInterface } from "@/interfaces/ReRankerModelInterface";
import { useModelProviderStore } from "@/store/modelProviderStore";

function ReRankerModelIndex() {
  const { org_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const providerType =
    searchParams.get("provider_type") || RerankerModelProviderTypeInterface.CLOUD;
  const provider = searchParams.get("provider") || "cohere";

  const { getRerankerModelProviders } = useModelProviderStore();
  const { reRankerModels, getAllReRankerModels, deleteReRankerModel } = useReRankerModelStore();

  const [providers, setProviders] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [doubleConfirm, setDoubleConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      if (getRerankerModelProviders) {
        const data = await getRerankerModelProviders();
        setProviders(data || ["cohere", "jina", "voyage", "baai"]);
      }
    };
    loadProviders();
  }, [getRerankerModelProviders]);

  useEffect(() => {
    if (org_id) {
      getAllReRankerModels(org_id);
    }
  }, [org_id, providerType, provider, getAllReRankerModels]);

  const handleProviderTypeChange = (value: string) => {
    setSearchParams({ provider_type: value, provider });
  };

  const handleProviderChange = (value: string) => {
    setSearchParams({ provider_type: providerType, provider: value });
  };

  const handleDelete = async (id: string) => {
    if (!org_id) return;
    if (doubleConfirm !== id) {
      setDoubleConfirm(id);
      return;
    }
    await deleteReRankerModel(org_id, id);
    setConfirmDeleteId(null);
    setDoubleConfirm(null);
  };

  // Filter models locally or let store handle it based on query params
  const filteredModels = reRankerModels?.filter(
    (model) =>
      model.provider_type === providerType &&
      model.provider.toLowerCase() === provider.toLowerCase(),
  );

  const isEmpty = !filteredModels || filteredModels.length === 0;

  return (
    <div className="space-y-6 max-w-[95%] mx-auto">
      {/* Header & Controls */}
      <h1 className="text-xl font-semibold">Re-Ranker Models</h1>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Provider Type Selector */}
          <select
            value={providerType}
            onChange={(e) => handleProviderTypeChange(e.target.value)}
            className="h-9 px-3 rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800 text-sm"
          >
            <option value={RerankerModelProviderTypeInterface.CLOUD}>Cloud</option>
            <option value={RerankerModelProviderTypeInterface.LOCAL}>Local</option>
          </select>

          {/* Provider Selector */}
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="h-9 px-3 rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800 text-sm"
          >
            {providers.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {/* Create Button */}
        <button
          onClick={() => setOpen(true)}
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
            <ListFilter className="w-8 h-8 text-primary-500" />
          </div>

          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
            No re-ranker models for {provider} ({providerType}) yet
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
            Be the first to add a re-ranker model under this provider. Improve search relevance by
            ranking results with precision.
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
          {filteredModels.map((model: ReRankerModelInterface) => (
            <div
              key={model.id}
              className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xs mb-2">ID: {model.id}</h2>
                    <h2 className="font-medium ">{model.name}</h2>
                    <p className="text-sm font-mono mt-1">Model ID: {model.model_id}</p>
                  </div>

                  <button
                    onClick={() => {
                      setConfirmDeleteId(model.id);
                      setDoubleConfirm(null);
                    }}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <p>
                    <b>Provider Type:</b>{" "}
                    <span className="uppercase text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {model.provider_type}
                    </span>
                  </p>
                  <p>
                    <b>Provider:</b> {model.provider}
                  </p>
                  <p>
                    <b>Model Name:</b> {model.model_name}
                  </p>
                  {model.size_in_gb !== null && model.size_in_gb !== undefined && (
                    <p>
                      <b>Size:</b> {model.size_in_gb} GB
                    </p>
                  )}
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {model.description}
                </p>

                {model.model_metadata && Object.keys(model.model_metadata).length > 0 && (
                  <div className="text-xs text-zinc-500 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60 overflow-x-auto">
                    <span className="font-semibold block mb-1 text-zinc-400">Metadata:</span>
                    <pre className="whitespace-pre-wrap font-mono text-zinc-400">
                      {JSON.stringify(model.model_metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {confirmDeleteId === model.id && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      setConfirmDeleteId(null);
                      setDoubleConfirm(null);
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 px-3 py-1 rounded-md transition-colors"
                  >
                    {doubleConfirm === model.id ? "Click to confirm" : "Delete"}
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
