import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useParams } from "react-router-dom";
import { Plus, Trash2, Loader2, BrainCircuit, Sparkles } from "lucide-react";

import { useSparseTextModelStore } from "@/store/sparseTextModelStore";
import type { CreateSparseTextModelInterface } from "@/interfaces/SparseTextModelInterface";

function SparseTextModelIndex() {
  const { org_id } = useParams<{ org_id: string }>();

  const { sparseTextModels, getAllSparseTextModels, createSparseTextModel, deleteSparseTextModel } =
    useSparseTextModelStore();

  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<CreateSparseTextModelInterface>({
    org_id: org_id || "",
    name: "",
    provider: "",
    model: "",
    description: "",
    size_in_gb: 0,
  });

  useEffect(() => {
    if (!org_id) return;
    const load = async () => {
      setIsLoading(true);
      await getAllSparseTextModels(org_id);
      setIsLoading(false);
    };
    load();
  }, [org_id]);

  const handleCreate = async () => {
    if (!org_id) return;
    setSubmitting(true);
    await createSparseTextModel(org_id, form);
    setForm({ org_id, name: "", provider: "", model: "", description: "", size_in_gb: 0 });
    setIsModalOpen(false);
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!org_id || !confirmDeleteId) return;
    await deleteSparseTextModel(org_id, confirmDeleteId);
    setConfirmDeleteId(null);
  };

  if (!org_id) return null;

  const isEmpty = !isLoading && (!sparseTextModels || sparseTextModels.length === 0);

  return (
    <div className="space-y-6 max-w-[1450px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sparse Text Models</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          <Plus size={16} />
          Add Model
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-zinc-500">
          <Loader2 className="animate-spin" size={16} />
          Loading models...
        </div>
      ) : isEmpty ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 mb-5">
            <BrainCircuit className="w-8 h-8 text-primary-500" />
          </div>

          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
            No sparse text models yet
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
            Be the first to add a sparse text model. Connect a provider, define your model, and
            start building.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition"
          >
            <Sparkles size={14} />
            Add your first model
          </button>
        </div>
      ) : (
        /* Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sparseTextModels?.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="font-medium">{m.name}</h2>
                  <p className="text-xs text-zinc-400 font-mono">ID: {m.id}</p>
                </div>

                <button
                  onClick={() => setConfirmDeleteId(m.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="text-xs text-zinc-400 space-y-1">
                <p>Provider: {m.provider}</p>
                <p>Model: {m.model}</p>
                <p>Size: {m.size_in_gb} GB</p>
              </div>
              <p className="text-xs text-zinc-500">{m.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 p-6 rounded-xl space-y-3 shadow-xl">
            <Dialog.Title className="text-lg font-semibold">Add Sparse Model</Dialog.Title>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800"
            />
            <input
              placeholder="Provider"
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800"
            />
            <input
              placeholder="Model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800"
            />
            <input
              type="number"
              placeholder="Size in GB"
              value={form.size_in_gb}
              onChange={(e) => setForm({ ...form, size_in_gb: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-2 border rounded-lg hover:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-60 hover:text-zinc-400"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* DELETE CONFIRM */}
      <Dialog.Root open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 p-6 rounded-xl space-y-4">
            <Dialog.Title className="text-lg font-semibold text-red-500">
              Delete Model?
            </Dialog.Title>
            <p className="text-sm text-zinc-500">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="px-3 py-2 bg-red-600 text-white rounded-lg">
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default SparseTextModelIndex;
