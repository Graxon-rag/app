import { mockRerankers } from "@/data/mockData";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { Plus } from "lucide-react";

const columns = [
  { key: "name", label: "Reranker Name" },
  { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
  { key: "provider", label: "Provider" },
  {
    key: "version",
    label: "Version",
    render: (v) => <span className="font-mono text-xs text-zinc-400">{v}</span>,
  },
  {
    key: "latency",
    label: "Avg Latency",
    render: (v) => <span className="font-mono text-xs">{v}</span>,
  },
];

export default function Rerankers() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{mockRerankers.length} rerankers configured</p>
        <button
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold
                           bg-primary-600 hover:bg-primary-700 text-white transition-all duration-150 shadow-sm"
        >
          <Plus size={14} /> Add Reranker
        </button>
      </div>
      <Table columns={columns} data={mockRerankers} />
    </div>
  );
}
