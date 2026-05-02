import { mockProjects } from "@/data/mockData";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { FolderOpen, Plus } from "lucide-react";

const columns = [
  { key: "name", label: "Project Name" },
  { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
  { key: "provider", label: "Provider" },
  { key: "models", label: "Models", render: (v) => <span className="font-mono text-xs">{v}</span> },
  {
    key: "createdAt",
    label: "Created",
    render: (v) => <span className="text-zinc-400 dark:text-zinc-600 text-xs">{v}</span>,
  },
];

export default function Projects() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{mockProjects.length} projects</p>
        <button
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold
                           bg-primary-600 hover:bg-primary-700 text-white transition-all duration-150 shadow-sm"
        >
          <Plus size={14} /> New Project
        </button>
      </div>
      <Table columns={columns} data={mockProjects} />
    </div>
  );
}
