import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  Webhook as WebhookIcon,
  Plus,
  Trash2,
  X,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useWebhookStore } from "@/store/webhookStore";
import { CreateWebhookInterface, WebhookInterface } from "@/interfaces/WebhookInterface";

interface WebhookTabProps {
  orgId: string;
  projectId: string;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex-shrink-0"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function CreateWebhookDialog({
  orgId,
  projectId,
  onCreate,
}: {
  orgId: string;
  projectId: string;
  onCreate: (payload: CreateWebhookInterface) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setUrl("");
    setToken("");
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!submitting) {
      setOpen(next);
      if (!next) reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !token.trim()) {
      setError("All fields are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`;

      await onCreate({
        org_id: orgId,
        project_id: projectId,
        id,
        name: name.trim(),
        url: url.trim(),
        token: token.trim(),
      });

      setOpen(false);
      reset();
    } catch (
      err: any // eslint-disable-line @typescript-eslint/no-explicit-any
    ) {
      setError(err?.message || "Failed to create webhook. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-5 space-y-4 z-50 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold">New Webhook</Dialog.Title>
              <Dialog.Description className="text-sm text-zinc-500 mt-0.5">
                We'll send POST requests to this URL on project events.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Slack notifications"
                className="w-full h-10 px-3 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                className="w-full h-10 px-3 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Token</label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Shared secret sent in headers"
                className="w-full h-10 px-3 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={submitting}
                  className="px-3 py-2 rounded-lg border dark:border-zinc-700 text-sm disabled:opacity-40"
                >
                  Cancel
                </button>
              </Dialog.Close>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-40 transition"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Webhook
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DeleteWebhookDialog({
  webhook,
  onConfirm,
}: {
  webhook: WebhookInterface;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const expected = `delete ${webhook.name}`;

  const handleOpenChange = (next: boolean) => {
    if (!deleting) {
      setOpen(next);
      if (!next) setConfirmText("");
    }
  };

  const handleDelete = async () => {
    if (confirmText !== expected) return;
    setDeleting(true);
    try {
      await onConfirm();
      setOpen(false);
      setConfirmText("");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex-shrink-0"
          title="Delete webhook"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-5 space-y-4 z-50 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold text-red-500">
            Delete Webhook
          </AlertDialog.Title>

          <AlertDialog.Description className="text-sm text-zinc-500">
            This action is irreversible. Type below to confirm.
          </AlertDialog.Description>

          <p className="text-xs text-zinc-400">
            Type: <span className="font-mono text-red-500">{expected}</span>
          </p>

          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete webhook_name"
            className="w-full h-10 px-3 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm"
          />

          <div className="flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={deleting}
                className="px-3 py-2 rounded-lg border dark:border-zinc-700 text-sm disabled:opacity-40"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>

            <button
              type="button"
              onClick={handleDelete}
              disabled={confirmText !== expected || deleting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-40 hover:bg-red-700 transition"
            >
              {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

function WebhookRow({
  webhook,
  onDelete,
}: {
  webhook: WebhookInterface;
  onDelete: () => Promise<void>;
}) {
  const [showToken, setShowToken] = useState(false);

  const maskedToken =
    webhook.token && webhook.token.length > 8
      ? `${webhook.token.slice(0, 4)}${"•".repeat(8)}${webhook.token.slice(-4)}`
      : "•".repeat(webhook.token?.length || 8);

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <WebhookIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <h3 className="font-medium truncate">{webhook.name}</h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 pl-6">
          <div
            onClick={(e) => e.stopPropagation()}
            className="font-mono truncate hover:underline hover:text-primary-600 flex items-center gap-1"
          >
            {webhook.url}
          </div>
          <CopyButton value={webhook.url} />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 pl-6">
          <span className="font-mono">{showToken ? webhook.token : maskedToken}</span>
          <button
            type="button"
            onClick={() => setShowToken((v) => !v)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title={showToken ? "Hide token" : "Show token"}
          >
            {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <CopyButton value={webhook.token} />
        </div>

        <p className="text-xs text-zinc-400 pl-6">Created {formatDate(webhook.created_at)}</p>
      </div>

      <DeleteWebhookDialog webhook={webhook} onConfirm={onDelete} />
    </div>
  );
}

function WebhookTab({ orgId, projectId }: WebhookTabProps) {
  const { webhooks, getAllWebhooks, createWebhook, deleteWebhook } = useWebhookStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId || !projectId) return;

    setLoading(true);
    getAllWebhooks(orgId, projectId).finally(() => setLoading(false));
  }, [orgId, projectId]);

  const handleCreate = async (payload: CreateWebhookInterface) => {
    await createWebhook(orgId, projectId, payload);
  };

  const handleDelete = async (id: string) => {
    await deleteWebhook(orgId, projectId, id);
  };

  return (
    <div className="space-y-4 ">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-medium">Webhooks</h2>
          <p className="text-sm text-zinc-500">
            Get notified via HTTP callbacks when events happen in this project.
          </p>
        </div>

        <CreateWebhookDialog orgId={orgId} projectId={projectId} onCreate={handleCreate} />
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading webhooks...</span>
        </div>
      ) : webhooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2 rounded-xl border border-dashed dark:border-zinc-800">
          <WebhookIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">No webhooks yet</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            Add a webhook to receive real-time updates for this project's events.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border dark:border-zinc-800 divide-y dark:divide-zinc-800 overflow-hidden">
          {webhooks.map((webhook) => (
            <WebhookRow
              key={webhook.id}
              webhook={webhook}
              onDelete={() => handleDelete(webhook.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default WebhookTab;
