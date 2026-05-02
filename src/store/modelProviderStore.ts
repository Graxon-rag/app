import { create } from "zustand";
import { axiosClient } from "@/utils/axiosClient";

interface ModelProviderInterface {
  llmModelProviders: string[];
  embeddingModelProviders: string[];
  allModelProviders: string[];
  getAllModelProviders: () => Promise<
    string[] | ["openai", "gemini", "claude", "deepseek", "voyage"]
  >;
  getLLMModelProviders: () => Promise<string[] | ["openai", "gemini", "claude", "deepseek"]>;
  getEmbeddingModelProviders: () => Promise<string[] | ["openai", "gemini", "voyage"]>;
}

export const useModelProviderStore = create<ModelProviderInterface>((set, get) => ({
  llmModelProviders: [],
  embeddingModelProviders: [],
  allModelProviders: [],
  getAllModelProviders: async () => {
    try {
      const response = await axiosClient.get(`/api/model-providers/all`);
      return response.data ?? ["openai", "gemini", "claude", "deepseek", "voyage"];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  getLLMModelProviders: async () => {
    try {
      const response = await axiosClient.get(`/api/model-providers/llm_model`);
      return response.data ?? ["openai", "gemini", "claude", "deepseek"];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  getEmbeddingModelProviders: async () => {
    try {
      const response = await axiosClient.get(`/api/model-providers/embedding_model`);
      return response.data ?? ["openai", "gemini", "voyage"];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
}));
