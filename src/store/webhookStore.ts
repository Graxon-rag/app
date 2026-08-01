import { create } from "zustand";
import { CreateWebhookInterface, WebhookInterface } from "@/interfaces/WebhookInterface";
import { axiosClient } from "@/utils/axiosClient";

interface WebhookModelStore {
  webhooks: WebhookInterface[];
  getAllWebhooks: (orgId: string, projectId: string) => Promise<void>;
  getWebhook: (orgId: string, projectId: string, id: string) => Promise<void>;
  createWebhook: (
    orgId: string,
    projectId: string,
    payload: CreateWebhookInterface,
  ) => Promise<void>;
  deleteWebhook: (orgId: string, provider: string, id: string) => Promise<void>;
}

export const useWebhookStore = create<WebhookModelStore>((set, get) => ({
  webhooks: [],
  getAllWebhooks: async (orgId: string, projectId: string) => {
    try {
      const url = `/api/webhooks/${orgId}/${projectId}/list`;

      const response = await axiosClient.get(url);
      const data = response.data?.data?.data ?? [];

      set({ webhooks: data });
    } catch (error) {
      console.log(error);
      set({ webhooks: [] });
    }
  },
  getWebhook: async (orgId: string, projectId: string, id: string) => {
    const url = `/api/webhooks/${orgId}/${projectId}/get/${id}`;

    const response = await axiosClient.get(url);
    const data = response.data?.data ?? null;

    return data;
  },
  createWebhook: async (orgId: string, projectId: string, payload: CreateWebhookInterface) => {
    try {
      const url = `/api/webhooks/${orgId}/${projectId}/create`;

      const response = await axiosClient.post(url, payload);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllWebhooks(orgId, projectId);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  deleteWebhook: async (orgId: string, projectId: string, id: string) => {
    try {
      const url = `/api/webhooks/${orgId}/${projectId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllWebhooks(orgId, projectId);
      }

      return data;
    } catch (error) {
      console.log(error);
      get().getAllWebhooks(orgId, projectId);
    }
  },
}));
