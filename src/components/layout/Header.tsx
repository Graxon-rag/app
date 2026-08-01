import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useOrgStore } from "@/store/orgStore";
import { useDocumentStore } from "@/store/documentStore";

type Crumb = {
  label: ReactNode;
  to?: string;
};

// Static text segments configuration
const segmentLabels: Record<string, string> = {
  organizations: "Organizations",
  projects: "Projects",
  docs: "Documents",
  "sparse-models": "Sparse Models",
  rerankers: "Rerankers",
  "llm-models": "LLM Models",
  "embedding-models": "Embedding Models",
  "model-credential": "Model Credentials",
  "ocr-models": "OCR Models",
  "audio-models": "Audio Models",
  "video-models": "Video Models",
};

// Labels for query-param-based tabs, e.g. /projects/:id?tab=documents
// (these don't show up as path segments, so buildCrumbs handles them separately)
const tabLabels: Record<string, string> = {
  documents: "Documents",
  config: "Config",
  webhooks: "Webhooks",
  "danger-zone": "Danger Zone",
  upload: "Upload",
  query: "Query",
  details: "Details",
};

export default function Header() {
  const { pathname, search } = useLocation();
  const { org_id, project_id, doc_id } = useParams<{
    org_id?: string;
    project_id?: string;
    doc_id?: string;
  }>();

  const getOrg = useOrgStore((state) => state.getOrg);
  const getDocument = useDocumentStore((state) => state.getDocument);

  const [orgName, setOrgName] = useState<string>("Loading...");
  const [docName, setDocName] = useState<string>("Loading...");

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

  // Fetch the human-readable Document name when on a /docs/:doc_id route
  useEffect(() => {
    if (!org_id || !project_id || !doc_id) return;

    let isMounted = true;
    getDocument(org_id, project_id, doc_id).then((doc) => {
      if (isMounted) {
        setDocName(doc ? doc.name : "Document");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [org_id, project_id, doc_id, getDocument]);

  // Construct standard procedural crumbs array dynamically
  const buildCrumbs = (): Crumb[] => {
    const crumbs: Crumb[] = [{ label: "Home", to: "/" }];
    const parts = pathname.split("/").filter(Boolean);
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath += `/${part}`;

      // 1. Org segment
      if (part === org_id) {
        crumbs.push({ label: orgName, to: currentPath });
        return;
      }

      // 2. Project segment
      if (part === project_id && parts[index - 1] === "projects") {
        crumbs.push({ label: part.replace(/[-_]/g, " "), to: currentPath });
        return;
      }

      // 3. Doc segment — link to the actual /view route, not the bare doc_id path
      if (part === doc_id && parts[index - 1] === "docs") {
        crumbs.push({ label: docName, to: `${currentPath}/view` });
        return;
      }

      // 4. "docs" segment — no route for bare /docs, link back to the tab
      if (part === "docs") {
        const projectPath = currentPath.slice(0, -`/${part}`.length);
        crumbs.push({ label: segmentLabels.docs, to: `${projectPath}?tab=documents` });
        return;
      }

      // 5. Static Segment Mapper
      if (segmentLabels[part]) {
        crumbs.push({ label: segmentLabels[part], to: currentPath });
        return;
      }
    });

    const tab = new URLSearchParams(search).get("tab");
    if (tab && tabLabels[tab]) {
      crumbs.push({ label: tabLabels[tab], to: `${pathname}?tab=${tab}` });
    }

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
