import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectStore } from "@/store/projectStore";

type Section = "llm" | "embedding" | "sparse" | "reranker" | "llm_cred" | "embedding_cred" | null;

function ProjectDetails() {
  const { org_id, project_id } = useParams();

  const { selectedProject, getProjectDetails, deleteProject } = useProjectStore();

  const [active, setActive] = useState<Section>(null);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    if (org_id && project_id) {
      getProjectDetails(org_id, project_id);
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
  };

  const p = selectedProject;

  const toggle = (key: Section) => {
    setActive(active === key ? null : key);
  };

  const cardClass = "p-4 rounded-xl border dark:border-zinc-800 cursor-pointer transition";

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        {/* LEFT SIDE */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{p.name}</h1>

          <p className="text-sm text-zinc-400">
            <b>ID:</b> {p.id}
          </p>

          <p className="text-sm text-zinc-400">
            <b>Readable ID:</b> {p.readable_id}
          </p>

          <p className="text-sm text-zinc-500">
            <b>Description:</b> {p.description}
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setOpenDelete(true)}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Delete Project
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* LLM */}
        <div className={cardClass} onClick={() => toggle("llm")}>
          <h2 className="font-medium">LLM Model</h2>
          <p className="text-sm text-zinc-500">{p.details?.llm_model?.name}</p>

          {active === "llm" && (
            <div className="mt-3 text-xs text-zinc-400 space-y-1">
              <p>
                <b>ID:</b> {p.details?.llm_model?.id}
              </p>
              <p>
                <b>Model:</b> {p.details?.llm_model?.model_id}
              </p>
              <p>
                <b>Provider:</b> {p.details?.llm_model?.provider}
              </p>
              <p>{p.details?.llm_model?.description}</p>
            </div>
          )}
        </div>

        {/* EMBEDDING */}
        <div className={cardClass} onClick={() => toggle("embedding")}>
          <h2 className="font-medium">Embedding Model</h2>
          <p className="text-sm text-zinc-500">{p.details?.embedding_model?.name}</p>

          {active === "embedding" && (
            <div className="mt-3 text-xs text-zinc-400 space-y-1">
              <p>
                <b>ID:</b> {p.details?.embedding_model?.id}
              </p>
              <p>
                <b>Model:</b> {p.details?.embedding_model?.model_id}
              </p>
              <p>
                <b>Dimension:</b> {p.details?.embedding_model?.dimension}
              </p>
              <p>{p.details?.embedding_model?.description}</p>
            </div>
          )}
        </div>

        {/* SPARSE */}
        <div className={cardClass} onClick={() => toggle("sparse")}>
          <h2 className="font-medium">Sparse Model</h2>
          <p className="text-sm text-zinc-500">{p.details?.sparse_text_model?.name}</p>

          {active === "sparse" && (
            <div className="mt-3 text-xs text-zinc-400 space-y-1">
              <p>
                <b>ID:</b> {p.details?.sparse_text_model?.id}
              </p>
              <p>
                <b>Provider:</b> {p.details?.sparse_text_model?.provider}
              </p>
              <p>{p.details?.sparse_text_model?.description}</p>
            </div>
          )}
        </div>

        {/* RERANKER */}
        <div className={cardClass} onClick={() => toggle("reranker")}>
          <h2 className="font-medium">Reranker</h2>
          <p className="text-sm text-zinc-500">{p.details?.reranker?.name}</p>

          {active === "reranker" && (
            <div className="mt-3 text-xs text-zinc-400 space-y-1">
              <p>
                <b>ID:</b> {p.details?.reranker?.id}
              </p>
              <p>
                <b>Model:</b> {p.details?.reranker?.model}
              </p>
              <p>{p.details?.reranker?.description}</p>
            </div>
          )}
        </div>

        {/* LLM CRED */}
        <div className={cardClass} onClick={() => toggle("llm_cred")}>
          <h2 className="font-medium">LLM Credential</h2>
          <p className="text-sm text-zinc-500">{p.details?.llm_model_credential?.name}</p>

          {active === "llm_cred" && (
            <div className="mt-3 text-xs text-zinc-400 space-y-1">
              <p>
                <b>Provider:</b> {p.details?.llm_model_credential?.provider}
              </p>
              <p>
                <b>API Key:</b> {p.details?.llm_model_credential?.api_key}
              </p>
              <p>{p.details?.llm_model_credential?.description}</p>
            </div>
          )}
        </div>

        {/* EMBED CRED */}
        <div className={cardClass} onClick={() => toggle("embedding_cred")}>
          <h2 className="font-medium">Embedding Credential</h2>
          <p className="text-sm text-zinc-500">{p.details?.embedding_model_credential?.name}</p>

          {active === "embedding_cred" && (
            <div className="mt-3 text-xs text-zinc-400 space-y-1">
              <p>
                <b>Provider:</b> {p.details?.embedding_model_credential?.provider}
              </p>
              <p>
                <b>API Key:</b> {p.details?.embedding_model_credential?.api_key}
              </p>
              <p>{p.details?.embedding_model_credential?.description}</p>
            </div>
          )}
        </div>
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
