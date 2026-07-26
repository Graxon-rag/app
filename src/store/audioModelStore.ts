import { create } from "zustand";
import { CreateAudioModelInterface, AudioModelInterface } from "@/interfaces/AudioModelInterface";
import { axiosClient } from "@/utils/axiosClient";

interface AudioModelStore {
  audioModels: AudioModelInterface[];
  getAllProviderAudioModels: (orgId: string, provider: string) => Promise<void>;
  getAudioModel: (orgId: string, id: string) => Promise<void>;
  createAudioModel: (orgId: string, payload: CreateAudioModelInterface) => Promise<void>;
  deleteAudioModel: (orgId: string, provider: string, id: string) => Promise<void>;
}

export const useAudioModelStore = create<AudioModelStore>((set, get) => ({
  audioModels: [],
  getAllProviderAudioModels: async (orgId: string, provider: string) => {
    try {
      const url = `/api/audio-models/${orgId}/get/all/provider/${provider}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data?.data ?? [];

      set({ audioModels: data });
    } catch (error) {
      console.log(error);
      set({ audioModels: [] });
    }
  },
  getAudioModel: async (orgId: string, id: string) => {
    try {
      const url = `/api/audio-models/${orgId}/get/${id}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data;

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  createAudioModel: async (orgId: string, payload: CreateAudioModelInterface) => {
    try {
      const url = `/api/audio-models/${orgId}/create`;

      const response = await axiosClient.post(url, payload);
      const data = response.data?.data;

      if (data) {
        get().getAllProviderAudioModels(orgId, payload.provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  deleteAudioModel: async (orgId: string, provider: string, id: string) => {
    try {
      const url = `/api/audio-models/${orgId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data;

      if (data) {
        get().getAllProviderAudioModels(orgId, provider);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
}));
