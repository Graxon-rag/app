import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useOCRModelStore } from "@/store/ocrModelStore";

interface Props {
  open: boolean;
  onClose: () => void;
  provider: string;
}

export default function CreateOCRModelModal({ open, onClose, provider }: Props) {
  const { org_id } = useParams();
  const { createOCRModel } = useOCRModelStore();
  const [metadataError, setMetadataError] = useState("");

  const [form, setForm] = useState({
    name: "",
    model_name: "",
    model_id: "",
    description: "",
    model_metadata: "{}",
  });

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!org_id || !provider) return;

    let metadata = {};

    try {
      metadata = form.model_metadata ? JSON.parse(form.model_metadata) : {};
    } catch {
      setMetadataError("Model metadata must be valid JSON.");
      return;
    }

    await createOCRModel(org_id, {
      org_id,
      provider,
      name: form.name,
      model_name: form.model_name,
      model_id: form.model_id,
      description: form.description,
      model_metadata: metadata,
    });

    setForm({
      name: "",
      model_name: "",
      model_id: "",
      description: "",
      model_metadata: "{}",
    });

    setMetadataError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Create OCR Model</h2>

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

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white"
        />
        <textarea
          name="model_metadata"
          placeholder='{"temperature":0.7,"max_tokens":4096}'
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

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 border cursor-pointer border-zinc-800 rounded text-white hover:text-zinc-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="h-9 px-4 bg-primary cursor-pointer text-white rounded hover:text-zinc-400"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
