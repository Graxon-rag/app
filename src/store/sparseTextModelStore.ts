import { create } from "zustand";
import {
  CreateSparseTextModelInterface,
  SparseTextModelInterface,
} from "@/interfaces/SparseTextModelInterface";
import { axiosClient } from "@/utils/axiosClient";

interface SparseTextModelStore {
  sparseTextModels: SparseTextModelInterface[] | null;
  createSparseTextModel: (
    orgId: string,
    sparseTextModel: CreateSparseTextModelInterface,
  ) => Promise<void>;
  getAllSparseTextModels: (orgId: string) => Promise<void>;
  getSparseTextModel: (orgId: string, id: string) => Promise<void>;
  deleteSparseTextModel: (orgId: string, id: string) => Promise<void>;
}

export const useSparseTextModelStore = create<SparseTextModelStore>((set, get) => ({
  sparseTextModels: null,

  createSparseTextModel: async (orgId: string, sparseTextModel: CreateSparseTextModelInterface) => {
    try {
      const url = `/api/sparse-text-models/${orgId}/create`;

      const response = await axiosClient.post(url, sparseTextModel);
      const data = response.data?.data;

      if (data) {
        get().getAllSparseTextModels(orgId);
      }
    } catch (error) {
      console.error(error);
    }
  },
  getAllSparseTextModels: async (orgId: string) => {
    try {
      const url = `/api/sparse-text-models/${orgId}/get/all`;

      const response = await axiosClient.get(url);
      const data = response.data?.data?.data ?? [];

      if (data) {
        set({ sparseTextModels: data });
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  getSparseTextModel: async (orgId: string, id: string) => {
    try {
      const url = `/api/sparse-text-models/${orgId}/get/${id}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data;

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  deleteSparseTextModel: async (orgId: string, id: string) => {
    try {
      const url = `/api/sparse-text-models/${orgId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data;

      if (data) {
        get().getAllSparseTextModels(orgId);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
}));
