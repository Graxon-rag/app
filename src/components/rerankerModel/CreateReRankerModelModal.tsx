import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useReRankerModelStore } from "@/store/reRankerModelStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateReRankerModelModal({ open, onClose }: Props) {
  const { org_id } = useParams();
  const { createReRankerModel } = useReRankerModelStore();

  const [form, setForm] = useState({
    name: "",
    provider: "",
    model: "",
    description: "",
    size_in_gb: "",
  });

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!org_id) return;

    await createReRankerModel(org_id, {
      org_id,
      name: form.name,
      provider: form.provider,
      model: form.model,
      description: form.description,
      size_in_gb: Number(form.size_in_gb),
    });

    setForm({
      name: "",
      provider: "",
      model: "",
      description: "",
      size_in_gb: "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Create Re-Ranker Model</h2>

          <button onClick={onClose} className="text-zinc-400">
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
          />

          <input
            name="provider"
            placeholder="Provider"
            value={form.provider}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
          />

          <input
            name="model"
            placeholder="Model"
            value={form.model}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
          />

          <input
            name="size_in_gb"
            type="number"
            placeholder="Size in GB"
            value={form.size_in_gb}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-zinc-800 text-zinc-300"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
