import { axiosClient } from "@/utils/axiosClient";
import {
  ChatMessageGetInterface,
  ChatMessageCreateInterface,
  ChatMessageListInterface,
} from "@/interfaces/ChatMessageInterface"; // Update path if needed
import { create } from "zustand";
import { PaginationInterface } from "@/interfaces/CommonInterface";

interface ChatMessageStore {
  messages: ChatMessageGetInterface[];
  currentMessage: ChatMessageGetInterface | null;
  pagination: PaginationInterface;
  isLoading: boolean;

  listMessages: (
    orgId: string,
    projectId: string,
    chatId: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;

  getMessage: (orgId: string, projectId: string, chatId: string, id: string) => Promise<void>;
}

export const useChatMessageStore = create<ChatMessageStore>((set, get) => ({
  messages: [],
  currentMessage: null,
  isLoading: false,
  pagination: {
    total_pages: 1,
    current_page: 1,
    current_limit: 10,
  },

  listMessages: async (
    orgId: string,
    projectId: string,
    chatId: string,
    page: number = 1,
    limit: number = 10,
  ) => {
    set({ isLoading: true });
    try {
      const url = `/api/chat-messages/${orgId}/${projectId}/${chatId}/list?page=${page}&limit=${limit}`;
      const response = await axiosClient.get<{ data: ChatMessageListInterface }>(url);
      const result = response.data?.data;

      set((state) => ({
        messages: page === 1 ? (result?.data ?? []) : [...state.messages, ...(result?.data ?? [])],

        pagination: result?.pagination ?? {
          total_pages: 1,
          current_page: page,
          current_limit: limit,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  getMessage: async (orgId: string, projectId: string, chatId: string, id: string) => {
    set({ isLoading: true });
    try {
      const url = `/api/chat-messages/${orgId}/${projectId}/${chatId}/get/${id}`;
      const response = await axiosClient.get<{ data: ChatMessageGetInterface }>(url);

      set({
        currentMessage: response.data?.data ?? null,
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },
}));
