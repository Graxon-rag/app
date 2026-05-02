import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useLLMModelStore } from "@/store/llmModelStore";

interface Props {
  open: boolean;
  onClose: () => void;
  provider: string;
}

export default function CreateLLMModelModal({ open, onClose, provider }: Props) {
  const { org_id } = useParams();
  const { createLLMModel } = useLLMModelStore();

  const [form, setForm] = useState({
    name: "",
    model_name: "",
    model_id: "",
    description: "",
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

    await createLLMModel(org_id, {
      org_id,
      provider,
      ...form,
    });

    setForm({
      name: "",
      model_name: "",
      model_id: "",
      description: "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Create LLM Model</h2>

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

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="h-9 px-4 border border-zinc-800 rounded text-white">
            Cancel
          </button>

          <button onClick={handleSubmit} className="h-9 px-4 bg-primary text-white rounded">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
