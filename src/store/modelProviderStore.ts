import { create } from "zustand";
import { axiosClient } from "@/utils/axiosClient";

interface ModelProviderInterface {
  llmModelProviders: string[];
  embeddingModelProviders: string[];
  allModelProviders: string[];
  audioModelProviders: string[];
  ocrModelProviders: string[];
  videoModelProviders: string[];
  rerankerModelProviders: string[];
  getAllModelProviders: () => Promise<
    string[] | ["openai", "gemini", "claude", "deepseek", "voyage"]
  >;
  getLLMModelProviders: () => Promise<string[] | ["openai", "gemini", "claude", "deepseek"]>;
  getEmbeddingModelProviders: () => Promise<string[] | ["openai", "gemini", "voyage"]>;
  getAudioModelProviders: () => Promise<
    string[] | ["deepgram", "gladia", "assemblyai", "elevenlabs", "groq"]
  >;
  getOCRModelProviders: () => Promise<string[] | ["datalab", "mistral", "llamaparse"]>;
  getVideoModelProviders: () => Promise<string[] | ["twelvelabs", "gemini"]>;
  getRerankerModelProviders: () => Promise<string[] | ["cohere", "jina", "voyage", "baai"]>;
}

export const useModelProviderStore = create<ModelProviderInterface>((set, get) => ({
  llmModelProviders: [],
  embeddingModelProviders: [],
  allModelProviders: [],
  audioModelProviders: [],
  ocrModelProviders: [],
  videoModelProviders: [],
  rerankerModelProviders: [],
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
  getAudioModelProviders: async () => {
    try {
      const response = await axiosClient.get(`/api/model-providers/audio-model`);
      return response.data ?? ["deepgram", "gladia", "assemblyai", "elevenlabs", "groq"];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  getOCRModelProviders: async () => {
    try {
      const response = await axiosClient.get(`/api/model-providers/ocr-model`);
      return response.data ?? ["datalab", "mistral", "llamaparse"];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  getVideoModelProviders: async () => {
    try {
      const response = await axiosClient.get(`/api/model-providers/video-model`);
      return response.data ?? ["twelvelabs", "gemini"];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  getRerankerModelProviders: async () => {
    try {
      const response = await axiosClient.get(`/api/model-providers/reranker-model`);
      return response.data ?? ["cohere", "jina", "voyage", "baai"];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
}));
