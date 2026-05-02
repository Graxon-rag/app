import { create } from "zustand";
import { OrgInterface, OrgCreateInterface } from "@/interfaces/OrgInterface";
import { axiosClient } from "@/utils/axiosClient";

interface OrgStore {
  orgs: OrgInterface[];
  isLoading: boolean;

  getAllOrgs: () => Promise<OrgInterface[]>;
  getOrg: (id: string) => Promise<OrgInterface | null>;
  createOrg: (org: OrgCreateInterface) => Promise<boolean>;
  deleteOrg: (id: string) => Promise<boolean>;

  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useOrgStore = create<OrgStore>((set, get) => ({
  orgs: [],
  isLoading: false,
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  getAllOrgs: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosClient.get(`/api/orgs/get/all`);
      const orgs = response.data?.data?.data ?? [];

      set({ orgs });
      return orgs;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  getOrg: async (id: string) => {
    try {
      const response = await axiosClient.get(`/api/orgs/get/${id}`);
      return response.data?.data ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  createOrg: async (org: OrgCreateInterface) => {
    try {
      const response = await axiosClient.post(`/api/orgs/create`, org);
      const newOrg = response.data?.data;

      if (newOrg) {
        get().getAllOrgs();
        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  deleteOrg: async (id: string) => {
    try {
      await axiosClient.delete(`/api/orgs/delete/${id}`);

      get().getAllOrgs();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
}));
