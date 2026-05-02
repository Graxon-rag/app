import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useModelProviderStore } from "@/store/modelProviderStore";
import { useModelCredentialStore } from "@/store/modelCredentialStore";
import CreateModelCredentialModal from "@/components/modelCredential/CreateModelCredentialModal";
import { ModelCredentialInterface } from "@/interfaces/ModelCredentialInterface";

function ModelCredentialIndex() {
  const { org_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const provider = searchParams.get("provider") || "deepseek";

  const { getAllModelProviders } = useModelProviderStore();
  const { modelCredentials, getAllModelCredentials, deleteModelCredential } =
    useModelCredentialStore();

  const [providers, setProviders] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [doubleConfirm, setDoubleConfirm] = useState<string | null>(null);

  // Load providers
  useEffect(() => {
    const load = async () => {
      const data = await getAllModelProviders();
      setProviders(data || []);
    };
    load();
  }, []);

  // Fetch credentials by provider
  useEffect(() => {
    if (org_id && provider) {
      getAllModelCredentials(org_id, provider);
    }
  }, [org_id, provider]);

  const handleProviderChange = (value: string) => {
    setSearchParams({ provider: value });
  };

  const handleDelete = async (id: string) => {
    if (!org_id) return;

    if (doubleConfirm !== id) {
      setDoubleConfirm(id);
      return;
    }

    await deleteModelCredential(org_id, provider, id);
    setConfirmDelete(null);
    setDoubleConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <h1 className="text-xl font-semibold">Model Credentials</h1>
      <div className="flex items-center justify-between">
        {/* Provider select */}
        <select
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="h-9 px-3 rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800"
        >
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Create */}
        <button
          onClick={() => setOpen(true)}
          disabled={!provider}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
        >
          <Plus size={14} />
          New Credential
        </button>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modelCredentials.map((cred: ModelCredentialInterface) => (
          <div
            key={cred.id}
            className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 space-y-3"
          >
            {/* HEADER */}
            <div className="flex justify-between">
              <div>
                <h2 className="font-medium">{cred.name}</h2>
                <p className="text-xs text-zinc-400">{cred.provider}</p>
              </div>

              <button onClick={() => setConfirmDelete(cred.id)} className="text-red-500">
                <Trash2 size={16} />
              </button>
            </div>

            {/* INFO */}
            <div className="text-sm text-zinc-500 space-y-1">
              <p>
                <b>Provider:</b> {cred.provider}
              </p>
              <p>
                <b>API Key:</b> ••••••••••••••••
              </p>
            </div>

            <p className="text-sm text-zinc-500">{cred.description}</p>

            {/* DELETE CONFIRM */}
            {confirmDelete === cred.id && (
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setConfirmDelete(null)} className="text-sm text-zinc-500">
                  Cancel
                </button>

                <button onClick={() => handleDelete(cred.id)} className="text-sm text-red-500">
                  {doubleConfirm === cred.id ? "Click again to confirm" : "Delete"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      <CreateModelCredentialModal open={open} onClose={() => setOpen(false)} provider={provider} />
    </div>
  );
}

export default ModelCredentialIndex;
