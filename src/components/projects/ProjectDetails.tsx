import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useProjectStore } from "@/store/projectStore";
import DocumentUpload from "@/components/projects/DocumentUpload";
import DocumentTable from "@/components/projects/DocumentTable";
import QueryTab from "@/components/projects/QueryTab";
import ConfigTab from "@/components/projects/ConfigTab";
import WebhookTab from "@/components/projects/WebhookTab";
import { VariablesDetailSection } from "./VariablesDetailSection";
import ChatLayout from "../chats/ChatLayout";

type TabKey =
  | "details"
  | "config"
  | "variables"
  | "query"
  | "upload"
  | "documents"
  | "webhooks"
  | "danger-zone"
  | "chats";

const TABS: { key: TabKey; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "upload", label: "Upload" },
  { key: "query", label: "Query" },
  { key: "chats", label: "Chats" },

  { key: "documents", label: "Documents" },
  { key: "config", label: "Config" },
  { key: "variables", label: "Variables" },
  { key: "webhooks", label: "Webhooks" },
  { key: "danger-zone", label: "Danger Zone" },
];

function ProjectDetails() {
  const { org_id, project_id } = useParams();

  const { selectedProject, getProject, deleteProject } = useProjectStore();

  const [confirmDelete, setConfirmDelete] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const tab = (searchParams.get("tab") as TabKey) || "details";

  const setTab = (value: TabKey) => {
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    if (org_id && project_id) {
      getProject(org_id, project_id);
    }
  }, [org_id, project_id]);

  if (!selectedProject) {
    return <div className="p-6 text-zinc-500">Loading project...</div>;
  }

  const handleDelete = async () => {
    if (!org_id || !project_id || !selectedProject) return;

    const expected = `delete ${selectedProject.name}`;

    if (confirmDelete !== expected) return;

    await deleteProject(org_id, project_id);

    setOpenDelete(false);
    setConfirmDelete("");

    navigate(`/organizations/${org_id}/projects`);
  };

  const p = selectedProject;

  const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <div className="flex items-center justify-between py-2.5 border-b last:border-b-0 dark:border-zinc-800">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 font-mono">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[95%] mx-auto">
      {/* TABS */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b dark:border-zinc-800">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 cursor-pointer ${
                tab === key ? "border-b-2 border-primary-600 text-primary-600" : "text-zinc-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* DETAILS TAB */}
        {tab === "details" && (
          <div className="space-y-6 max-w-2xl">
            {/* TITLE */}
            <div>
              <h1 className="text-xl font-semibold">{p.name}</h1>
              {p.description && <p className="text-sm text-zinc-500 mt-1">{p.description}</p>}
            </div>

            {/* INFO CARD */}
            <div className="rounded-xl border dark:border-zinc-800 px-4">
              <InfoRow label="Project ID" value={p.id} />
              <InfoRow label="Readable ID" value={p.readable_id} />
            </div>
          </div>
        )}

        {/* DANGER ZONE */}
        {tab === "danger-zone" && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <h2 className="text-sm font-medium text-red-600 dark:text-red-400">
                  Delete this project
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Once deleted, this cannot be undone.</p>
              </div>
              <button
                onClick={() => setOpenDelete(true)}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 flex-shrink-0"
              >
                Delete Project
              </button>
            </div>
          </div>
        )}

        {/* CONFIG TAB */}
        {tab === "config" && org_id && project_id && (
          <ConfigTab orgId={org_id} projectId={project_id} />
        )}

        {/* VARIABLES TAB */}
        {tab === "variables" && org_id && project_id && (
          <VariablesDetailSection orgId={org_id} projectId={project_id} />
        )}

        {/* QUERY TAB */}
        {tab === "query" && org_id && project_id && <QueryTab />}

        {/* UPLOAD TAB */}
        {tab === "upload" && org_id && project_id && (
          <DocumentUpload orgId={org_id} projectId={project_id} />
        )}

        {/* DOCUMENTS TAB */}
        {tab === "documents" && org_id && project_id && (
          <div className="flex flex-col gap-6 my-6 mt-10">
            <DocumentTable orgId={org_id} projectId={project_id} />
          </div>
        )}

        {tab === "chats" && org_id && project_id && (
          <div className="flex h-[calc(100vh-160px)] w-full border dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
            <ChatLayout />
          </div>
        )}

        {/* WEBHOOKS TAB */}
        {tab === "webhooks" && org_id && project_id && (
          <WebhookTab orgId={org_id} projectId={project_id} />
        )}
      </div>

      {openDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-5 space-y-4">
            <h2 className="text-lg font-semibold text-red-500">Delete Project</h2>

            <p className="text-sm text-zinc-500">
              This action is irreversible. Type below to confirm.
            </p>

            <p className="text-xs text-zinc-400">
              Type: <span className="font-mono text-red-500">delete {selectedProject.name}</span>
            </p>

            <input
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              placeholder="delete project_name"
              className="w-full h-10 px-3 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 text-sm"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setOpenDelete(false);
                  setConfirmDelete("");
                }}
                className="px-3 py-2 rounded-lg border dark:border-zinc-700"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={confirmDelete !== `delete ${selectedProject.name}`}
                className="px-3 py-2 rounded-lg bg-red-600 text-white disabled:opacity-40 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;
