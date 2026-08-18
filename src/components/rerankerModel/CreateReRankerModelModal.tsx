import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReRankerModelStore } from "@/store/reRankerModelStore";
import { RerankerModelProviderTypeInterface } from "@/interfaces/ReRankerModelInterface";
import { useModelProviderStore } from "@/store/modelProviderStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateReRankerModelModal({ open, onClose }: Props) {
  const { org_id } = useParams();

  const { getRerankerModelProviders } = useModelProviderStore();
  const { createReRankerModel } = useReRankerModelStore();
  const [metadataError, setMetadataError] = useState("");

  const [providers, setProviders] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    provider_type: RerankerModelProviderTypeInterface.CLOUD,
    provider: "",
    model_name: "",
    model_id: "",
    description: "",
    model_metadata: "",
    size_in_gb: "",
  });

  // Fetch providers when the modal opens
  useEffect(() => {
    if (open && getRerankerModelProviders) {
      getRerankerModelProviders().then((data) => {
        setProviders(data || ["cohere", "jina", "voyage", "baai"]);
      });
    }
  }, [open, getRerankerModelProviders]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!org_id) return;

    let metadata = {};

    try {
      metadata = form.model_metadata ? JSON.parse(form.model_metadata) : {};
    } catch {
      setMetadataError("Model metadata must be valid JSON.");
      return;
    }

    await createReRankerModel(org_id, {
      org_id,
      name: form.name,
      provider_type: form.provider_type,
      provider: form.provider,
      model_name: form.model_name,
      model_id: form.model_id,
      description: form.description,
      model_metadata: metadata,
      size_in_gb: form.size_in_gb ? Number(form.size_in_gb) : null,
    });

    // Reset form
    setForm({
      name: "",
      provider_type: RerankerModelProviderTypeInterface.CLOUD,
      provider: "",
      model_name: "",
      model_id: "",
      description: "",
      size_in_gb: "",
      model_metadata: "{}",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg cursor-pointer font-semibold text-zinc-100">
            Create Re-Ranker Model
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-300">
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <input
            name="name"
            placeholder="Name (e.g. Rerank English V3.0)"
            value={form.name}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
          />

          <div className="flex gap-3">
            <select
              name="provider_type"
              value={form.provider_type}
              onChange={handleChange}
              className="w-1/3 h-10 cursor-pointer px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
            >
              <option value={RerankerModelProviderTypeInterface.CLOUD}>Cloud</option>
              <option value={RerankerModelProviderTypeInterface.LOCAL}>Local</option>
            </select>

            <select
              name="provider"
              value={form.provider}
              onChange={handleChange}
              className="w-2/3 h-10 cursor-pointer px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
            >
              <option value="" disabled>
                Select Provider
              </option>
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <input
              name="model_name"
              placeholder="Model Name"
              value={form.model_name}
              onChange={handleChange}
              className="w-1/2 h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
            />

            <input
              name="model_id"
              placeholder="Model ID"
              value={form.model_id}
              onChange={handleChange}
              className="w-1/2 h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
          />
          <textarea
            name="model_metadata"
            placeholder="Metadata (Optional)"
            value={form.model_metadata}
            onChange={(e) => {
              setMetadataError("");
              setForm((prev) => ({
                ...prev,
                model_metadata: e.target.value,
              }));
            }}
            rows={6}
            className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-sm"
          />

          {metadataError && <p className="text-sm text-red-500">{metadataError}</p>}

          <input
            name="size_in_gb"
            type="number"
            step="0.1"
            placeholder="Size in GB (Optional)"
            value={form.size_in_gb}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="h-9 px-4 cursor-pointer rounded-lg border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="h-9 px-4 cursor-pointer rounded-lg border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
