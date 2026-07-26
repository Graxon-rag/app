import { create } from "zustand";
import { CreateOCRModelInterface, OCRModelInterface } from "@/interfaces/OCRModelInterface";
import { axiosClient } from "@/utils/axiosClient";

interface OCRModelStore {
  ocrModels: OCRModelInterface[];
  getAllProviderOCRModels: (orgId: string, provider: string) => Promise<void>;
  getOCRModel: (orgId: string, id: string) => Promise<void>;
  createOCRModel: (orgId: string, payload: CreateOCRModelInterface) => Promise<void>;
  deleteOCRModel: (orgId: string, provider: string, id: string) => Promise<void>;
}

export const useOCRModelStore = create<OCRModelStore>((set, get) => ({
  ocrModels: [],
  getAllProviderOCRModels: async (orgId: string, provider: string) => {
    try {
      const url = `/api/ocr-models/${orgId}/get/all/provider/${provider}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data?.data ?? [];

      set({ ocrModels: data });
    } catch (error) {
      console.log(error);
      set({ ocrModels: [] });
    }
  },
  getOCRModel: async (orgId: string, id: string) => {
    try {
      const url = `/api/ocr-models/${orgId}/get/${id}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data;

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  createOCRModel: async (orgId: string, payload: CreateOCRModelInterface) => {
    try {
      const url = `/api/ocr-models/${orgId}/create`;

      const response = await axiosClient.post(url, payload);
      const data = response.data?.data;

      if (data) {
        get().getAllProviderOCRModels(orgId, payload.provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  deleteOCRModel: async (orgId: string, provider: string, id: string) => {
    try {
      const url = `/api/ocr-models/${orgId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data;

      if (data) {
        get().getAllProviderOCRModels(orgId, provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
}));
