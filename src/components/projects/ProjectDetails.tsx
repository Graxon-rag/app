import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectStore } from "@/store/projectStore";

type Section = "llm" | "embedding" | "sparse" | "reranker" | "llm_cred" | "embedding_cred" | null;

function ProjectDetails() {
  const { org_id, project_id } = useParams();

  const { selectedProject, getProjectDetails } = useProjectStore();

  const [active, setActive] = useState<Section>(null);

  useEffect(() => {
    if (org_id && project_id) {
      getProjectDetails(org_id, project_id);
    }
  }, [org_id, project_id]);

  if (!selectedProject) {
    return <div className="p-6 text-zinc-500">Loading project...</div>;
  }

  const p = selectedProject;

  const toggle = (key: Section) => {
    setActive(active === key ? null : key);
  };

  const cardClass = "p-4 rounded-xl border dark:border-zinc-800 cursor-pointer transition";

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">{p.name}</h1>
        <p className="text-md text-zinc-400">
          {" "}
          <b>ID: </b>
          {p.id}
        </p>
        <p className="text-sm text-zinc-400">
          {" "}
          <b>Readable ID: </b>
          {p.readable_id}
        </p>
        <p className="text-sm text-zinc-500">
          {" "}
          <b>Description:</b> {p.description}
        </p>
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
    </div>
  );
}

export default ProjectDetails;
