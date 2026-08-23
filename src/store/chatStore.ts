import { axiosClient } from "@/utils/axiosClient";
import {
  ChatGetInterface,
  ChatCreateInterface,
  ChatUpdateInterface,
  ChatListInterface, // Imported here
} from "../interfaces/ChatInterface";
import { create } from "zustand";
import { PaginationInterface } from "@/interfaces/CommonInterface";

interface ChatStore {
  chats: ChatGetInterface[];
  currentChat: ChatGetInterface | null;
  pagination: PaginationInterface;
  isLoading: boolean;

  listChats: (orgId: string, projectId: string, page?: number, limit?: number) => Promise<void>;
  getChat: (orgId: string, projectId: string, id: string) => Promise<void>;
  createChat: (orgId: string, projectId: string, payload: ChatCreateInterface) => Promise<void>;
  renameChat: (
    orgId: string,
    projectId: string,
    id: string,
    payload: ChatUpdateInterface,
  ) => Promise<void>;
  deleteChat: (orgId: string, projectId: string, id: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  pagination: {
    total_pages: 1,
    current_page: 1,
    current_limit: 10,
  },

  listChats: async (orgId: string, projectId: string, page: number = 1, limit: number = 10) => {
    set({ isLoading: true });
    try {
      const url = `/api/chats/${orgId}/${projectId}/list?page=${page}&limit=${limit}`;

      // Strongly type the axios response wrapper
      const response = await axiosClient.get<{ data: ChatListInterface }>(url);
      const result = response.data?.data;

      set({
        chats: result?.data ?? [],
        pagination: result?.pagination ?? {
          total_pages: 1,
          current_page: page,
          current_limit: limit,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  getChat: async (orgId: string, projectId: string, id: string) => {
    set({ isLoading: true });
    try {
      const url = `/api/chats/${orgId}/${projectId}/${id}`;
      const response = await axiosClient.get<{ data: ChatGetInterface }>(url);
      set({ currentChat: response.data?.data ?? null, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  createChat: async (orgId: string, projectId: string, payload: ChatCreateInterface) => {
    try {
      const url = `/api/chats/${orgId}/${projectId}/create`;
      await axiosClient.post(url, payload);

      const { current_page, current_limit } = get().pagination;
      await get().listChats(orgId, projectId, current_page, current_limit);
    } catch (error) {
      console.error(error);
    }
  },

  renameChat: async (
    orgId: string,
    projectId: string,
    id: string,
    payload: ChatUpdateInterface,
  ) => {
    try {
      const url = `/api/chats/${orgId}/${projectId}/update/${id}/rename`;
      await axiosClient.put(url, payload);

      const { current_page, current_limit } = get().pagination;
      await get().listChats(orgId, projectId, current_page, current_limit);
    } catch (error) {
      console.error(error);
    }
  },

  deleteChat: async (orgId: string, projectId: string, id: string) => {
    try {
      const url = `/api/chats/${orgId}/${projectId}/delete/${id}`;
      await axiosClient.delete(url);

      const { current_page, current_limit } = get().pagination;
      await get().listChats(orgId, projectId, current_page, current_limit);
    } catch (error) {
      console.error(error);
    }
  },
}));
