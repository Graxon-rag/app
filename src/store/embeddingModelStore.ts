import { create } from "zustand";
import {
  CreateEmbeddingModelInterface,
  EmbeddingModelInterface,
} from "@/interfaces/EmbeddingModelInterface";
import { axiosClient } from "@/utils/axiosClient";

interface EmbeddingModelStoreInterface {
  embeddingModels: EmbeddingModelInterface[];
  createEmbeddingModel: (orgId: string, payload: CreateEmbeddingModelInterface) => void;
  getAllProviderEmbeddingModels: (orgId: string, provider: string) => void;
  getEmbeddingModel: (orgId: string, id: string) => void;
  deleteEmbeddingModel: (orgId: string, provider: string, id: string) => void;
}

export const useEmbeddingModelStore = create<EmbeddingModelStoreInterface>((set, get) => ({
  embeddingModels: [],
  createEmbeddingModel: async (orgId: string, payload: CreateEmbeddingModelInterface) => {
    try {
      const url = `/api/embedding-models/${orgId}/create`;

      const response = await axiosClient.post(url, payload);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllProviderEmbeddingModels(orgId, payload.provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  getAllProviderEmbeddingModels: async (orgId: string, provider: string) => {
    try {
      const url = `/api/embedding-models/${orgId}/get/all/provider/${provider}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data?.data ?? [];

      set({ embeddingModels: data });
    } catch (error) {
      console.log(error);
      set({ embeddingModels: [] });
    }
  },
  getEmbeddingModel: async (orgId: string, id: string) => {
    try {
      const url = `/api/embedding-models/${orgId}/get/${id}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data ?? null;

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  deleteEmbeddingModel: async (orgId: string, provider: string, id: string) => {
    try {
      const url = `/api/embedding-models/${orgId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllProviderEmbeddingModels(orgId, provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
}));
