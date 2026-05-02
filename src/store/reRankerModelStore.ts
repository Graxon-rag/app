import { create } from "zustand";
import {
  CreateReRankerModelInterface,
  ReRankerModelInterface,
} from "@/interfaces/ReRankerModelInterface";
import { axiosClient } from "@/utils/axiosClient";

interface ReRankerModelStore {
  reRankerModels: ReRankerModelInterface[];

  getAllReRankerModels: (orgId: string) => Promise<void>;
  getReRankerModel: (orgId: string, id: string) => Promise<ReRankerModelInterface | null>;

  createReRankerModel: (
    orgId: string,
    reRankerModel: CreateReRankerModelInterface,
  ) => Promise<ReRankerModelInterface | null>;

  deleteReRankerModel: (orgId: string, id: string) => Promise<void>;
}

export const useReRankerModelStore = create<ReRankerModelStore>((set, get) => ({
  reRankerModels: [],

  //  GET ALL
  getAllReRankerModels: async (orgId) => {
    try {
      const response = await axiosClient.get(`/api/rerankers/${orgId}/get/all`);

      const data: ReRankerModelInterface[] = response.data?.data?.data ?? [];

      set({ reRankerModels: data }); // 🔥 IMPORTANT
    } catch (error) {
      console.error(error);
      set({ reRankerModels: [] });
    }
  },

  //  GET ONE
  getReRankerModel: async (orgId, id) => {
    try {
      const response = await axiosClient.get(`/api/rerankers/${orgId}/get/${id}`);

      return response.data?.data ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  //  CREATE
  createReRankerModel: async (orgId, payload) => {
    try {
      const response = await axiosClient.post(`/api/rerankers/${orgId}/create`, payload);

      const data = response.data?.data ?? null;

      if (data) {
        await get().getAllReRankerModels(orgId); // refresh store
      }

      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // DELETE
  deleteReRankerModel: async (orgId, id) => {
    try {
      const response = await axiosClient.delete(`/api/rerankers/${orgId}/delete/${id}`);

      const data = response.data?.data ?? null;

      if (data) {
        await get().getAllReRankerModels(orgId); // refresh store
      }

      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
}));
