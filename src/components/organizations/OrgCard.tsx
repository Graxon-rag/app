import { useNavigate } from "react-router-dom";
import { Users, FolderOpen, ArrowRight } from "lucide-react";

type OrgColor = "indigo" | "emerald" | "violet" | "rose" | "amber" | "cyan";

type OrgPlan = "Starter" | "Pro" | "Enterprise";

export interface Org {
  id: string;
  name: string;
  description: string;
  avatar: string;
  color: OrgColor;
  plan: OrgPlan;
  memberCount: number;
  projectCount: number;
}

interface OrgCardProps {
  org: Org;
}

const colorMap: Record<OrgColor, string> = {
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400",
};

const planMap: Record<OrgPlan, string> = {
  Starter: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  Pro: "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400",
  Enterprise: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

export default function OrgCard({ org }: OrgCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/organizations/${org.id}/projects`)}
      className="card p-5 text-left w-full group
                 hover:border-primary-300 dark:hover:border-primary-500/40
                 hover:shadow-md hover:shadow-primary-500/5
                 transition-all duration-200 animate-fade-in"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm ${
            colorMap[org.color] ?? colorMap.indigo
          }`}
        >
          {org.avatar}
        </div>

        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${planMap[org.plan]}`}>
          {org.plan}
        </span>
      </div>

      <h3 className="font-display font-bold text-zinc-900 dark:text-zinc-50 text-base mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {org.name}
      </h3>

      <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-4 leading-relaxed">
        {org.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-600">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {org.memberCount}
          </span>

          <span className="flex items-center gap-1">
            <FolderOpen size={12} />
            {org.projectCount}
          </span>
        </div>

        <ArrowRight
          size={14}
          className="text-zinc-300 dark:text-zinc-700 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all duration-150"
        />
      </div>
    </button>
  );
}
