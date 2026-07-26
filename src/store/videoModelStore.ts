import { create } from "zustand";
import { CreateVideoModelInterface, VideoModelInterface } from "@/interfaces/VideoModelInterface";
import { axiosClient } from "@/utils/axiosClient";

interface VideoModelStore {
  videoModels: VideoModelInterface[];
  getAllProviderVideoModels: (orgId: string, provider: string) => Promise<void>;
  getVideoModel: (orgId: string, id: string) => Promise<void>;
  createVideoModel: (orgId: string, payload: CreateVideoModelInterface) => Promise<void>;
  deleteVideoModel: (orgId: string, provider: string, id: string) => Promise<void>;
}

export const useVideoModelStore = create<VideoModelStore>((set, get) => ({
  videoModels: [],
  getAllProviderVideoModels: async (orgId: string, provider: string) => {
    try {
      const url = `/api/video-models/${orgId}/get/all/provider/${provider}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data?.data ?? [];

      set({ videoModels: data });
    } catch (error) {
      console.log(error);
      set({ videoModels: [] });
    }
  },
  getVideoModel: async (orgId: string, id: string) => {
    try {
      const url = `/api/video-models/${orgId}/get/${id}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data;

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  createVideoModel: async (orgId: string, payload: CreateVideoModelInterface) => {
    try {
      const url = `/api/video-models/${orgId}/create`;

      const response = await axiosClient.post(url, payload);
      const data = response.data?.data;

      if (data) {
        get().getAllProviderVideoModels(orgId, payload.provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  deleteVideoModel: async (orgId: string, provider: string, id: string) => {
    try {
      const url = `/api/video-models/${orgId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data;

      if (data) {
        get().getAllProviderVideoModels(orgId, provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
}));
