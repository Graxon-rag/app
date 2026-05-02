import { NavLink, useParams, useLocation } from "react-router-dom";
import type { ComponentType } from "react";
import {
  Home,
  Building2,
  FolderOpen,
  Braces,
  ArrowUpDown,
  Cpu,
  Layers,
  Hexagon,
  Github,
} from "lucide-react";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { mockOrganizations } from "@/data/mockData";
import logo from "@/assets/img/Graxon-wbg.png";

type IconType = ComponentType<{ size?: number; strokeWidth?: number }>;

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: IconType;
  end?: boolean;
}

const rootLinks: SidebarLinkProps[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/organizations", label: "Organizations", icon: Building2 },
];

const orgLinks = (orgId: string): SidebarLinkProps[] => [
  {
    to: `/organizations/${orgId}/projects`,
    label: "Projects",
    icon: FolderOpen,
  },
  {
    to: `/organizations/${orgId}/sparse-models`,
    label: "Sparse Text Model",
    icon: Braces,
  },
  {
    to: `/organizations/${orgId}/rerankers`,
    label: "Reranker",
    icon: ArrowUpDown,
  },
  {
    to: `/organizations/${orgId}/llm-models`,
    label: "LLM Model",
    icon: Cpu,
  },
  {
    to: `/organizations/${orgId}/embedding-models`,
    label: "Embedding Model",
    icon: Layers,
  },
];

function SidebarLink({ to, label, icon: Icon, end }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
    >
      <Icon size={15} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { org_id } = useParams<{ org_id?: string }>();
  const location = useLocation();

  const isInsideOrg = Boolean(org_id || location.pathname.startsWith("/organizations/"));

  const activeOrg = org_id ? mockOrganizations.find((o) => o.id === org_id) : null;

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col z-30"
      style={{ width: "var(--sidebar-width)" }}
    >
      <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800" />

      <div className="relative flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <img src={logo} alt="Graxon logo" width={70} />

          <span className="font-display font-bold text-zinc-900 dark:text-zinc-50 text-base tracking-tight">
            Graxon
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          <div className="mb-2">
            {rootLinks.map((link) => (
              <SidebarLink key={link.to} {...link} />
            ))}
          </div>

          {isInsideOrg && org_id && (
            <>
              <div className="my-3 mx-3 border-t border-zinc-100 dark:border-zinc-800" />

              {activeOrg && (
                <div className="flex items-center gap-2 px-3 mb-2">
                  <div className="w-5 h-5 rounded-md bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-primary-700 dark:text-primary-400">
                      {activeOrg.avatar}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                    {activeOrg.name}
                  </span>
                </div>
              )}

              <p className="section-label">Organization</p>

              {orgLinks(org_id).map((link) => (
                <SidebarLink key={link.to} {...link} />
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <a href="https://github.com/Graxon-rag/graxon" target="_blank">
              <Github className="h-4 w-4" />
            </a>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
