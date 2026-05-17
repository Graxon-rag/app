import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useOrgStore } from "@/store/orgStore";

type Crumb = {
  label: ReactNode;
  to?: string;
};

// Static text segments configuration
const segmentLabels: Record<string, string> = {
  organizations: "Organizations",
  projects: "Projects",
  "sparse-models": "Sparse Models",
  rerankers: "Rerankers",
  "llm-models": "LLM Models",
  "embedding-models": "Embedding Models",
  "model-credential": "Model Credentials",
};

export default function Header() {
  const { pathname } = useLocation();
  const { org_id, project_id } = useParams<{ org_id?: string; project_id?: string }>();

  const getOrg = useOrgStore((state) => state.getOrg);
  const [orgName, setOrgName] = useState<string>("Loading...");

  // Fetch or resolve the human-readable Org Name when the route parameter alters
  useEffect(() => {
    if (!org_id) return;

    let isMounted = true;
    getOrg(org_id).then((org) => {
      if (isMounted) {
        setOrgName(org ? org.name : "Organization");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [org_id, getOrg]);

  // Construct standard procedural crumbs array dynamically
  const buildCrumbs = (): Crumb[] => {
    const crumbs: Crumb[] = [{ label: "Home", to: "/" }];
    const parts = pathname.split("/").filter(Boolean);
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath += `/${part}`;

      // 1. Check if the segment matches your active Org ID parameters
      if (part === org_id) {
        crumbs.push({
          label: orgName,
          to: currentPath,
        });
        return;
      }

      // 2. Fallback Project segment parsing (Using raw text / capitalized formatting until you hook up your Project API/Store)
      if (part === project_id && parts[index - 1] === "projects") {
        crumbs.push({
          label: part.replace(/[-_]/g, " "),
          to: currentPath,
        });
        return;
      }

      // 3. Static Segment Mapper
      if (segmentLabels[part]) {
        crumbs.push({
          label: segmentLabels[part],
          to: currentPath,
        });
        return;
      }
    });

    return crumbs;
  };

  const crumbs = buildCrumbs();

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5
                 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl
                 border-b border-zinc-200 dark:border-zinc-800"
    >
      <div className="flex flex-col gap-0.5">
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
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
