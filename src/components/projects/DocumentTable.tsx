import React, { useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";
import { DocumentInterface } from "@/interfaces/DocumentInterface";

function DocumentTable({ orgId, projectId }: { orgId: string; projectId: string }) {
  const { documents, getAllDocuments, deleteDocument, getPresignedUrl, submitForProcessDocument } =
    useDocumentStore();

  useEffect(() => {
    getAllDocuments(orgId, projectId);
  }, [orgId, projectId]);

  const handleView = async (doc: DocumentInterface) => {
    const url = await getPresignedUrl(orgId, projectId, doc.bucket, doc.key);
    // console.log("URL", url);

    if (url) window.open(url, "_blank");
  };

  const handleObjectView = (doc: DocumentInterface) => {
    const url = `${import.meta.env.VITE_MINIO_URL}/browser/${doc.bucket}/${doc.key}`;
    window.open(url, "_blank");
  };

  const handleDelete = async (doc: DocumentInterface) => {
    if (!confirm("Delete this document?")) return;
    await deleteDocument(orgId, projectId, doc.id);
    await getAllDocuments(orgId, projectId);
  };

  const handleProcess = async (doc: DocumentInterface) => {
    try {
      await submitForProcessDocument(orgId, projectId, doc.id);
      alert("Submitted for processing");
    } catch (error) {
      console.log(error);
    }
  };
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-500 text-white";
      case "PROCESSING":
        return "bg-blue-500 text-white";
      case "PROCESSED":
        return "bg-green-500 text-white";
      case "FAILED":
        return "bg-red-500 text-white";
      case "QUEUED":
        return "bg-yellow-500 text-white";
      default:
        return "bg-zinc-500 text-white";
    }
  };

  return (
    <div className="rounded-xl mb-10 border bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
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
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${getStatusStyles(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
              </td>

              <td className="p-3">{new Date(doc.created_at).toLocaleString()}</td>

              {/* ✅ ACTION MENU */}
              <td className="p-3 text-right">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content
                    align="start"
                    className="z-50 min-w-[160px] rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-md p-1"
                  >
                    {/* PROCESS */}
                    {doc.status === "PENDING" && (
                      <DropdownMenu.Item
                        onClick={() => handleProcess(doc)}
                        className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Process
                      </DropdownMenu.Item>
                    )}

                    {/* VIEW */}
                    <DropdownMenu.Item
                      onClick={() => handleView(doc)}
                      className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      View
                    </DropdownMenu.Item>

                    {/* OBJECT STORE */}
                    <DropdownMenu.Item
                      onClick={() => handleObjectView(doc)}
                      className="px-3 py-2 text-left text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Open in Object Store
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                    {/* DELETE */}
                    <DropdownMenu.Item
                      onClick={() => handleDelete(doc)}
                      className="px-3 py-2 text-left text-sm rounded-md cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
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
