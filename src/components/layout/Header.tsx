import { useLocation, useParams, Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { mockOrganizations } from "@/data/mockData";

type Crumb = {
  label: ReactNode;
  to?: string;
};

type SegKey = "projects" | "sparse-models" | "rerankers" | "llm-models" | "embedding-models";

function buildCrumbs(pathname: string, orgId?: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Home", to: "/" }];

  if (pathname.startsWith("/organizations")) {
    crumbs.push({ label: "Organizations", to: "/organizations" });
  }

  if (orgId) {
    const org = mockOrganizations.find((o) => o.id === orgId);

    if (org) {
      crumbs.push({
        label: org.name,
        to: `/organizations/${orgId}/projects`,
      });
    }

    const segMap: Record<SegKey, string> = {
      projects: "Projects",
      "sparse-models": "Sparse Models",
      rerankers: "Rerankers",
      "llm-models": "LLM Models",
      "embedding-models": "Embedding Models",
    };

    const parts = pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] as SegKey | undefined;

    if (last && last in segMap) {
      crumbs.push({ label: segMap[last as SegKey] });
    }
  }

  return crumbs;
}

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/organizations": "Organizations",
  projects: "Projects",
  "sparse-models": "Sparse Text Models",
  rerankers: "Rerankers",
  "llm-models": "LLM Models",
  "embedding-models": "Embedding Models",
};

export default function Header() {
  const { pathname } = useLocation();
  const { org_id } = useParams<{ org_id?: string }>();

  const crumbs = buildCrumbs(pathname, org_id);

  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];

  const title = pageTitles[last] || pageTitles[pathname] || "Graxon";

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5
                 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl
                 border-b border-zinc-200 dark:border-zinc-800"
    >
      <div className="flex flex-col gap-0.5">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-600">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={11} />}

              {crumb.to && i < crumbs.length - 1 ? (
                <Link
                  to={crumb.to}
                  className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={i === crumbs.length - 1 ? "text-zinc-600 dark:text-zinc-400" : ""}>
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </div>

        {/* <h1 className="text-base font-display font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
          {title}
        </h1> */}
      </div>
    </header>
  );
}
