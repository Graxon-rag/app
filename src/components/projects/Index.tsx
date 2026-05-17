import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { ProjectInterface } from "@/interfaces/ProjectInterface";

function ProjectIndex() {
  const { org_id } = useParams();
  const navigate = useNavigate();

  const { projects, getAllProjects } = useProjectStore();

  useEffect(() => {
    if (org_id) {
      getAllProjects(org_id);
    }
  }, [org_id]);

  return (
    <div className="space-y-6 max-w-[1450px] mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Projects</h1>

        {/* CREATE BUTTON */}
        <button
          onClick={() => navigate("create")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
        >
          <Plus size={14} />
          Create Project
        </button>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(projects || []).map((project: ProjectInterface) => (
          <div
            key={project.id}
            onClick={() => navigate(project.id)}
            className="cursor-pointer p-4 rounded-xl border flex  justify-between bg-white dark:bg-zinc-900 dark:border-zinc-800 hover:shadow-sm transition"
            title={`Open ${project.name}`}
          >
            <div>
              <h2 className="font-medium">{project.name}</h2>

              <p className="text-xs text-zinc-400">{project.readable_id}</p>

              <p className="text-sm text-zinc-500 mt-2">{project.description}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectIndex;
