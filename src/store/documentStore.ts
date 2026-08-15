import { create } from "zustand";
import { DocumentInterface, DocumentFilters } from "@/interfaces/DocumentInterface";
import { PaginationInterface } from "@/interfaces/CommonInterface";
import { axiosClient } from "@/utils/axiosClient";

interface DocumentStore {
  documents: DocumentInterface[];
  pagination: PaginationInterface;
  getAllDocuments: (orgId: string, projectId: string, filters: DocumentFilters) => Promise<void>;
  uploadDocument: (
    orgId: string,
    projectId: string,
    documentId: string,
    file: File,
    params?: DocumentFilters,
  ) => Promise<void>;
  getDocument: (orgId: string, projectId: string, id: string) => Promise<DocumentInterface | null>;
  deleteDocument: (
    orgId: string,
    projectId: string,
    id: string,
    params?: DocumentFilters,
  ) => Promise<DocumentInterface | null>;
  getPresignedUrl: (
    orgId: string,
    projectId: string,
    bucket: string,
    key: string,
  ) => Promise<string | null>;
  submitForProcessDocument: (
    orgId: string,
    projectId: string,
    id: string,
    params?: DocumentFilters,
  ) => Promise<boolean>;
  initMultipartUpload: (
    orgId: string,
    projectId: string,
    documentId: string,
    fileName: string,
  ) => Promise<{ uploadId: string; key: string } | null>;
  getPresignedPartUrl: (
    orgId: string,
    projectId: string,
    documentId: string,
    uploadId: string,
    key: string,
    partNumber: number,
  ) => Promise<string | null>;
  completeMultipartUpload: (
    orgId: string,
    projectId: string,
    documentId: string,
    uploadId: string,
    key: string,
    fileName: string,
    fileSize: number | null,
    parts: { etag: string; part_number: number }[],
    isOCRNeeded: boolean,
  ) => Promise<boolean>;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  pagination: {
    total_pages: 1,
    current_page: 1,
    current_limit: 10,
  },
  getAllDocuments: async (orgId: string, projectId: string, filters: DocumentFilters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append("types", v));
          } else {
            params.append(key, String(value));
          }
        }
      });
      const url = `/api/documents/${orgId}/projects/${projectId}/get/all?${params.toString()}`;
      const response = await axiosClient.get(url);
      const result = response.data?.data?.data;
      set({
        documents: result?.data ?? [],
        pagination: result?.pagination ?? {
          total_pages: 1,
          current_page: filters.page || 1,
          current_limit: filters.limit || 10,
        },
      });
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
  uploadDocument: async (
    orgId: string,
    projectId: string,
    documentId: string,
    file: File,
    params: DocumentFilters = {},
  ) => {
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
        get().getAllDocuments(orgId, projectId, params);
      }
    } catch (error) {
      console.log(error);
    }
  },
  deleteDocument: async (
    orgId: string,
    projectId: string,
    id: string,
    params: DocumentFilters = {},
  ) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllDocuments(orgId, projectId, params);
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

      // console.log(data);

      const signedUrl = data?.data?.signed_url ?? null;

      return signedUrl;
    } catch (error) {
      console.log(error);
    }
  },
  submitForProcessDocument: async (
    orgId: string,
    projectId: string,
    id: string,
    params: DocumentFilters = {},
  ) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/process/${id}`;

      const response = await axiosClient.post(url);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllDocuments(orgId, projectId, params);
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
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

  getPresignedPartUrl: async (orgId, projectId, documentId, uploadId, key, partNumber) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/upload/multipart/${documentId}/presigned-url`;
      const response = await axiosClient.post(url, {
        upload_id: uploadId,
        key,
        part_number: partNumber,
      });
      return response.data?.data?.url ?? null;
    } catch (error) {
      console.error("Failed to get presigned part URL", error);
      return null;
    }
  },

  completeMultipartUpload: async (
    orgId,
    projectId,
    documentId,
    uploadId,
    key,
    fileName,
    fileSize,
    parts,
    isOCRNeeded,
  ) => {
    try {
      const url = `/api/documents/${orgId}/projects/${projectId}/upload/multipart/${documentId}/complete`;
      const response = await axiosClient.post(url, {
        upload_id: uploadId,
        key,
        file_name: fileName,
        size: fileSize,
        is_ocr_needed: isOCRNeeded,
        parts,
      });
      return !!response.data?.data;
    } catch (error) {
      console.error("Failed to complete multipart upload", error);
      return false;
    }
  },
}));
