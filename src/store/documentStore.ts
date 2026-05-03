import { create } from "zustand";
import { DocumentInterface } from "@/interfaces/DocumentInterface";
import { axiosClient } from "@/utils/axiosClient";

interface DocumentStore {
  documents: DocumentInterface[];
  getAllDocuments: (orgId: string, projectId: string) => Promise<void>;
  uploadDocument: (orgId: string, projectId: string, file: File) => Promise<void>;
  getDocument: (orgId: string, projectId: string, id: string) => Promise<DocumentInterface | null>;
  deleteDocument: (
    orgId: string,
    projectId: string,
    id: string,
  ) => Promise<DocumentInterface | null>;
  getPresignedUrl: (
    orgId: string,
    projectId: string,
    bucket: string,
    key: string,
  ) => Promise<string | null>;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  getAllDocuments: async (orgId: string, projectId: string) => {
    const url = `/api/documents/${orgId}/projects/${projectId}/get/all`;

    const response = await axiosClient.get(url);

    set({ documents: response.data?.data?.data ?? [] });
  },
  getDocument: async (orgId: string, projectId: string, id: string) => {
    const url = `/api/documents/${orgId}/projects/${projectId}/get/${id}`;

    const response = await axiosClient.get(url);

    return response.data?.data ?? null;
  },
  uploadDocument: async (orgId: string, projectId: string, file: File) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/upload`;

      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data?.data ?? null;
      if (data) {
        get().getAllDocuments(orgId, projectId);
      }
    } catch (error) {
      console.log(error);
    }
  },
  deleteDocument: async (orgId: string, projectId: string, id: string) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllDocuments(orgId, projectId);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  getPresignedUrl: async (orgId: string, projectId: string, bucket: string, key: string) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/get-signed-url/?bucket=${bucket}&key=${key}`;

      const response = await axiosClient.get(url);
      const data = response.data ?? null;

      return data;
    } catch (error) {
      console.log(error);
    }
  },
}));
