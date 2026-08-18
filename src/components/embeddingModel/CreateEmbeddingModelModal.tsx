import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEmbeddingModelStore } from "@/store/embeddingModelStore";
import {
  GeminiEmbeddingModelDimension,
  OpenaiEmbeddingModelDimension,
  VoyageEmbeddingModelDimension,
} from "@/constants/embeddingModel";

// Helper mapping to get options based on the provider string
const PROVIDER_DIMENSIONS: Record<string, string[]> = {
  gemini: Object.values(GeminiEmbeddingModelDimension),
  openai: Object.values(OpenaiEmbeddingModelDimension),
  voyage: Object.values(VoyageEmbeddingModelDimension),
};

interface Props {
  open: boolean;
  onClose: () => void;
  provider: string; // e.g., "openai", "gemini", or "voyage"
}

export default function CreateEmbeddingModelModal({ open, onClose, provider }: Props) {
  const { org_id } = useParams();
  const { createEmbeddingModel } = useEmbeddingModelStore();

  // Get the available dimensions for the current provider (fallback to empty array)
  const availableDimensions = PROVIDER_DIMENSIONS[provider.toLowerCase()] || [];

  const [form, setForm] = useState({
    name: "",
    model_name: "",
    model_id: "",
    dimension: "",
    description: "",
  });

  // Automatically set the first available dimension when the provider changes or modal opens
  useEffect(() => {
    if (open && availableDimensions.length > 0) {
      setForm((prev) => ({ ...prev, dimension: availableDimensions[0] }));
    }
  }, [open, provider]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!org_id || !provider) return;

    await createEmbeddingModel(org_id, {
      org_id,
      provider,
      name: form.name,
      model_name: form.model_name,
      model_id: form.model_id,
      dimension: Number(form.dimension),
      description: form.description,
    });

    setForm({
      name: "",
      model_name: "",
      model_id: "",
      dimension: availableDimensions[0] || "",
      description: "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Create Embedding Model</h2>

        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded bg-zinc-900 border border-zinc-800 text-white"
        />

        <input
          name="model_name"
          placeholder="Model Name"
          value={form.model_name}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded bg-zinc-900 border border-zinc-800 text-white"
        />

        <input
          name="model_id"
          placeholder="Model ID"
          value={form.model_id}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded bg-zinc-900 border border-zinc-800 text-white"
        />

        {/* Replaced input with select dropdown */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 pl-1">Dimension</label>
          <select
            name="dimension"
            value={form.dimension}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded bg-zinc-900 border border-zinc-800 text-white focus:outline-none"
          >
            {availableDimensions.map((dim) => (
              <option key={dim} value={dim} className="bg-zinc-900">
                {dim}
              </option>
            ))}
            {availableDimensions.length === 0 && <option value="">Select a provider first</option>}
          </select>
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 cursor-pointer border border-zinc-800 rounded text-white hover:text-zinc-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="h-9 px-4 cursor-pointer bg-primary text-white rounded hover:text-zinc-400"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
