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
  Mic,
  Shield,
  Video,
  Image,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { mockOrganizations } from "@/data/mockData";
import logo from "@/assets/img/Graxon-wbg.png";

type IconType = ComponentType<{ size?: number; strokeWidth?: number }>;

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: IconType;
  end?: boolean;
  isCollapsed?: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const rootLinks: SidebarLinkProps[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/organizations", label: "Organizations", icon: Building2 },
];

const orgLinks = (orgId: string): SidebarLinkProps[] => [
  { to: `/organizations/${orgId}/projects`, label: "Projects", icon: FolderOpen },
  { to: `/organizations/${orgId}/sparse-models`, label: "Sparse Model", icon: Braces },
  { to: `/organizations/${orgId}/rerankers`, label: "Reranker Model", icon: ArrowUpDown },
  { to: `/organizations/${orgId}/llm-models`, label: "LLM Model", icon: Cpu },
  { to: `/organizations/${orgId}/embedding-models`, label: "Embedding Model", icon: Layers },
  { to: `/organizations/${orgId}/ocr-models`, label: "OCR Model", icon: Image },
  { to: `/organizations/${orgId}/audio-models`, label: "Audio/STT Model", icon: Mic },
  { to: `/organizations/${orgId}/video-models`, label: "Video Model", icon: Video },
  { to: `/organizations/${orgId}/model-credential`, label: "Model Credential", icon: Shield },
];

function SidebarLink({ to, label, icon: Icon, end, isCollapsed }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) =>
        `sidebar-link flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
          isActive
            ? "active bg-zinc-100 dark:bg-zinc-800"
            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        } ${isCollapsed ? "justify-center" : ""}`
      }
    >
      <Icon size={18} strokeWidth={2} />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { org_id } = useParams<{ org_id?: string }>();
  const location = useLocation();

  const isInsideOrg = Boolean(org_id || location.pathname.startsWith("/organizations/"));
  const activeOrg = org_id ? mockOrganizations.find((o) => o.id === org_id) : null;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen flex flex-col z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[70px]" : "w-64"
      }`}
    >
      <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800" />

      <div className="relative flex flex-col h-full">
        {/* Header & Logo */}
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-4 py-4 border-b border-zinc-100 dark:border-zinc-800/80`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Graxon logo" width={30} />
              <span className="font-display font-bold text-zinc-900 dark:text-zinc-50 text-base tracking-tight">
                Graxon
              </span>
            </div>
          )}

          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-zinc-100 cursor-pointer dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-hide">
          <div className="mb-2">
            {rootLinks.map((link) => (
              <SidebarLink key={link.to} {...link} isCollapsed={isCollapsed} />
            ))}
          </div>

          {isInsideOrg && org_id && (
            <>
              <div className="my-3 mx-3 border-t border-zinc-100 dark:border-zinc-800" />

              {activeOrg && (
                <div
                  className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2 px-3"} mb-2`}
                >
                  <div
                    className="w-6 h-6 rounded-md bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center flex-shrink-0"
                    title={isCollapsed ? activeOrg.name : undefined}
                  >
                    <span className="text-[10px] font-bold text-primary-700 dark:text-primary-400">
                      {activeOrg.avatar}
                    </span>
                  </div>
                  {!isCollapsed && (
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                      {activeOrg.name}
                    </span>
                  )}
                </div>
              )}

              {!isCollapsed && (
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mt-4 mb-2">
                  Organization
                </p>
              )}

              {orgLinks(org_id).map((link) => (
                <SidebarLink key={link.to} {...link} isCollapsed={isCollapsed} />
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div
          className={`px-3 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center ${isCollapsed ? "flex-col gap-4 justify-center" : "justify-between"}`}
        >
          <a
            href="https://github.com/Graxon-rag/graxon"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <SiGithub className="h-4 w-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
