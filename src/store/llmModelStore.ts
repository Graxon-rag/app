import { create } from "zustand";
import { CreateLLMModelInterface, LLMModelInterface } from "@/interfaces/LLMModelInterface";
import { axiosClient } from "@/utils/axiosClient";

interface LLMModelStore {
  llmModels: LLMModelInterface[];
  getAllProviderLLMModels: (orgId: string, provider: string) => Promise<void>;
  getLLMModel: (orgId: string, id: string) => Promise<void>;
  createLLMModel: (orgId: string, payload: CreateLLMModelInterface) => Promise<void>;
  deleteLLMModel: (orgId: string, provider: string, id: string) => Promise<void>;
}

export const useLLMModelStore = create<LLMModelStore>((set, get) => ({
  llmModels: [],
  getAllProviderLLMModels: async (orgId: string, provider: string) => {
    try {
      const url = `/api/llm-models/${orgId}/get/all/provider/${provider}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data?.data ?? [];

      set({ llmModels: data });
    } catch (error) {
      console.log(error);
      set({ llmModels: [] });
    }
  },
  getLLMModel: async (orgId: string, id: string) => {
    try {
      const url = `/api/llm-models/${orgId}/get/${id}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data;

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  createLLMModel: async (orgId: string, payload: CreateLLMModelInterface) => {
    try {
      const url = `/api/llm-models/${orgId}/create`;

      const response = await axiosClient.post(url, payload);
      const data = response.data?.data;

      if (data) {
        get().getAllProviderLLMModels(orgId, payload.provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  deleteLLMModel: async (orgId: string, provider: string, id: string) => {
    try {
      const url = `/api/llm-models/${orgId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data;

      if (data) {
        get().getAllProviderLLMModels(orgId, provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
}));
