import React, { useState } from "react";
import { useDocumentStore } from "@/store/documentStore";

function DocumentUpload({ orgId, projectId }: { orgId: string; projectId: string }) {
  const { uploadDocument, getAllDocuments } = useDocumentStore();
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    try {
      setLoading(true);
      await uploadDocument(orgId, projectId, file);
      await getAllDocuments(orgId, projectId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800">
      <h2 className="text-sm font-medium mb-2">Upload Document</h2>

      <input type="file" onChange={handleUpload} className="text-sm" />

      {loading && <p className="text-xs mt-2 text-zinc-500">Uploading...</p>}
    </div>
  );
}

export default DocumentUpload;
