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
    search?: string,
    chunk_number?: number,
    chunk_id?: string,
    id?: string,
    sort_by?: string,
    sort_order?: string,
  ) => Promise<void>;
}

export const useChunkStore = create<ChunkStore>((set) => ({
  chunks: [],
  pagination: null,
  isLoading: false,

  fetchChunks: async (
    orgId,
    projectId,
    docId,
    page = 1,
    limit = 10,
    search,
    chunk_number,
    chunk_id,
    id,
    sort_by = "chunk_number",
    sort_order = "desc",
  ) => {
    set({ isLoading: true });
    try {
      const url = `/api/chunks/${orgId}/${projectId}/${docId}/chunks/list`;

      // Build params object dynamically to avoid sending undefined values
      const params: Record<string, any> = { page, limit, sort_by, sort_order };
      if (search) params.search = search;
      if (chunk_number !== undefined && !isNaN(chunk_number)) params.chunk_number = chunk_number;
      if (chunk_id) params.chunk_id = chunk_id;
      if (id) params.id = id;

      const response = await axiosClient.get(url, { params });

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
