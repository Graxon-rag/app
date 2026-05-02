import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useOrgStore } from "@/store/orgStore";
import type { OrgCreateInterface } from "@/interfaces/OrgInterface";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

function OrganizationIndex() {
  const { getAllOrgs, orgs, isLoading, createOrg, deleteOrg, isModalOpen, openModal, closeModal } =
    useOrgStore();

  const [form, setForm] = useState<OrgCreateInterface>({
    name: "",
    description: "",
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllOrgs();
  }, []);

  const handleCreate = async () => {
    setSubmitting(true);
    const ok = await createOrg(form);

    if (ok) {
      setForm({ name: "", description: "" });
      closeModal();
    }

    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    await deleteOrg(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Organizations</h1>

        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
        >
          <Plus size={16} />
          Create Org
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-zinc-500">
          <Loader2 className="animate-spin" size={16} />
          Loading organizations...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org) => (
            <Link
              to={`/organizations/${org.id}`}
              key={org.id}
              className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="font-medium">{org.name}</h2>

                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                    <span className=" font-semibold">ID :</span> {org.id}
                  </p>
                </div>

                <button
                  onClick={() => setConfirmDeleteId(org.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="text-sm text-zinc-500">
                <span className=" font-semibold">Description :</span> {org.description}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* CREATE MODAL (Radix) */}
      <Dialog.Root open={isModalOpen} onOpenChange={closeModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />

          <Dialog.Content className="fixed left-1/2 top-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-4">
            <Dialog.Title className="text-lg font-semibold">Create Organization</Dialog.Title>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-3 py-2 rounded-lg border dark:border-zinc-700"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog.Root open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />

          <Dialog.Content className="fixed left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-zinc-900 p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold text-red-500">
              Delete Organization?
            </Dialog.Title>

            <p className="text-sm text-zinc-500">This action cannot be undone.</p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-2 rounded-lg border dark:border-zinc-700"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default OrganizationIndex;
