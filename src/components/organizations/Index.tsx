import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useOrgStore } from "@/store/orgStore";
import type { OrgCreateInterface } from "@/interfaces/OrgInterface";
import { Plus, Trash2, Loader2, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

function OrganizationIndex() {
  const { getAllOrgs, orgs, isLoading, createOrg, deleteOrg, isModalOpen, openModal, closeModal } =
    useOrgStore();

  const [form, setForm] = useState<OrgCreateInterface>({
    name: "",
    description: "",
  });
  const [deleteInput, setDeleteInput] = useState("");

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

    const org = orgs.find((o) => o.id === confirmDeleteId);
    if (!org) return;

    const expected = `delete ${org.name}`;

    if (deleteInput !== expected) {
      return; // block delete
    }

    await deleteOrg(confirmDeleteId);

    setConfirmDeleteId(null);
    setDeleteInput("");
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Organizations</h1>

        <button
          onClick={openModal}
          className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
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
            <div className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-2">
              <Link to={`/organizations/${org.id}`} className="space-y-2 flex justify-between">
                <div>
                  <div className="space-y-1">
                    <h2 className="font-medium">{org.name}</h2>

                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                      <span className=" font-semibold">ID :</span> {org.id}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-500">
                    <span className=" font-semibold">Description :</span> {org.description}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>

              <div className="flex justify-end">
                <button
                  onClick={() => setConfirmDeleteId(org.id)}
                  className="text-red-500 cursor-pointer hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
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
                className="px-3 py-2 cursor-pointer rounded-lg border dark:border-zinc-700"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-3 py-2 rounded-lg cursor-pointer bg-primary-600 text-white hover:bg-primary-700"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog.Root
        open={!!confirmDeleteId}
        onOpenChange={() => {
          setConfirmDeleteId(null);
          setDeleteInput("");
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />

          <Dialog.Content className="fixed left-1/2 top-1/2 w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-zinc-900 p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold text-red-500">
              Delete Organization
            </Dialog.Title>

            <p className="text-sm text-zinc-500">
              This action is permanent. Type below to confirm deletion.
            </p>

            {/* Org name hint */}
            <p className="text-xs text-zinc-400">
              Type:{" "}
              <span className="font-mono text-red-500">
                delete {orgs.find((o) => o.id === confirmDeleteId)?.name}
              </span>
            </p>

            {/* INPUT */}
            <input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="delete org_name"
              className="w-full h-10 px-3 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm"
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setConfirmDeleteId(null);
                  setDeleteInput("");
                }}
                className="px-3 py-2 cursor-pointer rounded-lg border dark:border-zinc-700"
              >
                Cancel
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={
                  deleteInput !== `delete ${orgs.find((o) => o.id === confirmDeleteId)?.name}`
                }
                className="px-3 py-2 cursor-pointer rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
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
