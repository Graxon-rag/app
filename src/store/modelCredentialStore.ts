import { create } from "zustand";
import {
  CreateModelCredentialInterface,
  ModelCredentialInterface,
} from "@/interfaces/ModelCredentialInterface";
import { axiosClient } from "@/utils/axiosClient";

interface ModelCredentialState {
  modelCredentials: ModelCredentialInterface[];
  getAllModelCredentials: (orgId: string, provider: string) => Promise<void>;
  createModelCredential: (orgId: string, payload: CreateModelCredentialInterface) => Promise<void>;
  deleteModelCredential: (orgId: string, provider: string, id: string) => Promise<void>;
}

export const useModelCredentialStore = create<ModelCredentialState>((set, get) => ({
  modelCredentials: [],

  getAllModelCredentials: async (orgId: string, provider: string) => {
    try {
      const url = `/api/model-credentials/${orgId}/get/all/provider/${provider}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data?.data ?? [];

      set({ modelCredentials: data });
    } catch (error) {
      console.log(error);
      set({ modelCredentials: [] });
    }
  },

  createModelCredential: async (orgId: string, payload: CreateModelCredentialInterface) => {
    try {
      const url = `/api/model-credentials/${orgId}/create`;

      const response = await axiosClient.post(url, payload);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllModelCredentials(orgId, payload.provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },

  deleteModelCredential: async (orgId: string, provider: string, id: string) => {
    try {
      const url = `/api/model-credentials/${orgId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllModelCredentials(orgId, provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
}));
