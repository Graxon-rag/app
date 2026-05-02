import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useModelCredentialStore } from "@/store/modelCredentialStore";

interface Props {
  open: boolean;
  onClose: () => void;
  provider: string;
}

export default function CreateModelCredentialModal({ open, onClose, provider }: Props) {
  const { org_id } = useParams();
  const { createModelCredential } = useModelCredentialStore();

  const [form, setForm] = useState({
    name: "",
    description: "",
    api_key: "",
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

    await createModelCredential(org_id, {
      org_id,
      provider,
      name: form.name,
      description: form.description,
      api_key: form.api_key,
    });

    setForm({
      name: "",
      description: "",
      api_key: "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Create Model Credential</h2>

        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded bg-zinc-900 border border-zinc-800 text-white"
        />

        <input
          name="api_key"
          placeholder="API Key"
          value={form.api_key}
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
