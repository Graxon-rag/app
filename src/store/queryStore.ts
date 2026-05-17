import { create } from "zustand";
import { axiosClient } from "@/utils/axiosClient";
import { QueryDepth, QueryInterface, QueryResponse, QueryType } from "@/interfaces/QueryInterface";

interface QueryStore {
  isLoading: boolean;
  query: (payload: QueryInterface) => Promise<QueryResponse>;
}

export const useQueryStore = create<QueryStore>((set, get) => ({
  isLoading: false,

  query: async (payload: QueryInterface) => {
    if (!payload.query || payload.query.trim().length === 0) {
      return { answer: "Query cannot be empty." };
    }

    set({ isLoading: true });

    try {
      // Fallback definitions for defaults
      const queryType = payload.query_type ?? QueryType.SMART;
      const queryDepth = payload.query_depth ?? QueryDepth.STANDARD;

      // Base URL structure mapping with encoded query parameters
      let url = `/api/query/${payload.org_id}/projects/${payload.project_id}?query=${encodeURIComponent(payload.query)}&top_k=${payload.top_k}&query_type=${queryType}&query_depth=${queryDepth}`;

      // Conditionally append document_id if it is provided and not null/empty
      if (payload.document_id && payload.document_id.trim() !== "") {
        url += `&document_id=${payload.document_id}`;
      }

      // Send the GET request.
      const response = await axiosClient.get(url);
      const result = response.data;

      if (result?.success) {
        return result.data ?? { answer: "No answer found." };
      }

      return { answer: result?.message ?? "No answer found." };
    } catch (error) {
      console.error("Query Error:", error);
      return { answer: "An error occurred while processing your query." };
    } finally {
      set({ isLoading: false });
    }
  },
}));
