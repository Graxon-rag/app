import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import DocumentViewerComponent from "@/components/document/document-viewer/DocumentViewer";
import { useDocumentStore } from "@/store/documentStore";
import type { DocumentInterface } from "@/interfaces/DocumentInterface"; // adjust path to wherever this actually lives

function DocumentViewerPage() {
  const { org_id, project_id, doc_id } = useParams();
  const { getDocument, getPresignedUrl } = useDocumentStore();

  const [doc, setDoc] = useState<DocumentInterface | null>(null);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!org_id || !project_id || !doc_id) return;

    let cancelled = false;
    setDoc(null);
    setPresignedUrl(null);
    setError(null);

    (async () => {
      try {
        const fetchedDoc = await getDocument(org_id, project_id, doc_id);
        if (cancelled) return;

        if (!fetchedDoc) {
          setError("Document not found.");
          return;
        }
        setDoc(fetchedDoc);

        const url = await getPresignedUrl(org_id, project_id, fetchedDoc.bucket, fetchedDoc.key);
        if (cancelled) return;

        if (!url) {
          setError("Couldn't get a download link for this file.");
          return;
        }
        setPresignedUrl(url);
      } catch {
        if (!cancelled) setError("Something went wrong loading this document.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [org_id, project_id, doc_id, getDocument, getPresignedUrl]);

  if (!org_id || !project_id || !doc_id) {
    return <PageMessage icon="error" text="Missing document reference." />;
  }

  if (error) {
    return <PageMessage icon="error" text={error} />;
  }

  if (!doc || !presignedUrl) {
    return <PageMessage icon="loading" text="Loading document…" />;
  }

  return (
    <div className="mx-auto">
      <DocumentViewerComponent url={presignedUrl} fileName={doc.name} />
    </div>
  );
}

function PageMessage({ icon, text }: { icon: "loading" | "error"; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-neutral-500">
      {icon === "loading" ? (
        <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
      ) : (
        <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
      )}
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default DocumentViewerPage;
