import React, { useEffect } from "react";
import { useDocumentStore } from "@/store/documentStore";

function DocumentTable({ orgId, projectId }: { orgId: string; projectId: string }) {
  const { documents, getAllDocuments } = useDocumentStore();

  useEffect(() => {
    getAllDocuments(orgId, projectId);
  }, [orgId, projectId]);

  return (
    <div className="rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          <tr>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Type</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Created</th>
            <th className="text-right p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-t dark:border-zinc-800">
              <td className="p-3">{doc.name}</td>
              <td className="p-3">{doc.type}</td>
              <td className="p-3">
                <span className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                  {doc.status}
                </span>
              </td>
              <td className="p-3">{new Date(doc.created_at).toLocaleString()}</td>

              <td className="p-3 text-right space-x-2">
                {/* PROCESS */}
                {doc.status === "PENDING" && (
                  <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                    Process
                  </button>
                )}

                {/* VIEW */}
                <button className="text-xs px-2 py-1 bg-green-600 text-white rounded">View</button>

                {/* OBJECT STORE */}
                <button className="text-xs px-2 py-1 bg-purple-600 text-white rounded">
                  Object
                </button>

                {/* DELETE */}
                <button
                  onClick={() => {
                    if (confirm("Delete this document?")) {
                      console.log("delete", doc.id);
                    }
                  }}
                  className="text-xs px-2 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {documents.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-6 text-zinc-500">
                No documents found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentTable;
