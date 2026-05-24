import { create } from "zustand";
import { DocumentInterface } from "@/interfaces/DocumentInterface";
import { axiosClient } from "@/utils/axiosClient";

interface DocumentStore {
  documents: DocumentInterface[];
  getAllDocuments: (orgId: string, projectId: string) => Promise<void>;
  uploadDocument: (
    orgId: string,
    projectId: string,
    documentId: string,
    file: File,
  ) => Promise<void>;
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
  submitForProcessDocument: (orgId: string, projectId: string, id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  getAllDocuments: async (orgId: string, projectId: string) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/get/all`;

      const response = await axiosClient.get(url);

      set({ documents: response.data?.data?.data ?? [] });
    } catch (error) {
      console.log(error);
      set({ documents: [] });
    }
  },
  getDocument: async (orgId: string, projectId: string, id: string) => {
    const url = `/api/documents/${orgId}/projects/${projectId}/get/${id}`;

    const response = await axiosClient.get(url);

    return response.data?.data ?? null;
  },
  uploadDocument: async (orgId: string, projectId: string, documentId: string, file: File) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/upload/${documentId}`;

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
  submitForProcessDocument: async (orgId: string, projectId: string, id: string) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/process/${id}`;

      const response = await axiosClient.post(url);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllDocuments(orgId, projectId);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  initMultipartUpload: async (
    orgId: string,
    projectId: string,
    documentId: string,
    fileName: string,
  ) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/upload/multipart/${documentId}/init/${fileName}`;
      const response = await axiosClient.post(url);
      const data = response.data?.data ?? null;
      if (!data) return null;
      return { uploadId: data.upload_id, key: data.key };
    } catch (error) {
      console.error("Failed to initiate multipart upload", error);
      return null;
    }
  },

  getPresignedPartUrl: async (
    orgId: string,
    projectId: string,
    documentId: string,
    uploadId: string,
    key: string,
    partNumber: number,
  ) => {
    try {
      const encodedKey = encodeURIComponent(key);
      const url = `/api/documents/${orgId}/projects/${projectId}/upload/multipart/${documentId}/presigned-url/${encodedKey}/${uploadId}/part/${partNumber}`;
      const response = await axiosClient.get(url);
      return response.data?.data?.url ?? null;
    } catch (error) {
      console.error("Failed to get presigned part URL", error);
      return null;
    }
  },

  completeMultipartUpload: async (
    orgId: string,
    projectId: string,
    documentId: string,
    uploadId: string,
    key: string,
    fileName: string,
    parts: any,
  ) => {
    try {
      const encodedKey = encodeURIComponent(key);
      const url = `/api/documents/${orgId}/projects/${projectId}/upload/multipart/${documentId}/complete/${encodedKey}/${uploadId}/${fileName}`;
      const response = await axiosClient.post(url, parts);
      return !!response.data?.data;
    } catch (error) {
      console.error("Failed to complete multipart upload", error);
      return false;
    }
  },
}));
