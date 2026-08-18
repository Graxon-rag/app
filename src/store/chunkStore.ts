import { create } from "zustand";
import { ChunkInterface } from "@/interfaces/ChunkInterface";
import { PaginationInterface } from "@/interfaces/CommonInterface";
import { axiosClient } from "@/utils/axiosClient";

interface ChunkStore {
  chunks: ChunkInterface[];
  pagination: PaginationInterface | null;
  isLoading: boolean;
  fetchChunks: (
    orgId: string,
    projectId: string,
    docId: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
}

export const useChunkStore = create<ChunkStore>((set) => ({
  chunks: [],
  pagination: null,
  isLoading: false,

  fetchChunks: async (orgId, projectId, docId, page = 1, limit = 10) => {
    set({ isLoading: true });
    try {
      const url = `/api/chunks/${orgId}/${projectId}/${docId}/chunks/list`;
      const response = await axiosClient.get(url, { params: { page, limit } });

      if (response.data?.success) {
        set({
          chunks: response.data?.data?.data ?? [],
          pagination: response.data?.data?.pagination ?? {},
        });
      }
    } catch (error) {
      console.error("Failed to fetch chunks", error);
      set({ chunks: [], pagination: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
