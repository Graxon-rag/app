import { create } from "zustand";
import {
  CreateProjectInterface,
  ProjectInterface,
  ProjectDetailInterface,
} from "@/interfaces/ProjectInterface";
import { axiosClient } from "@/utils/axiosClient";

interface ProjectStore {
  projects: ProjectInterface[] | null;
  selectedProject: ProjectDetailInterface | null;
  getAllProjects: (orgId: string) => Promise<void>;
  getProject: (orgId: string, id: string) => Promise<void>;
  getProjectDetails: (orgId: string, id: string) => Promise<void>;
  createProject(orgId: string, payload: CreateProjectInterface): Promise<void>;
  deleteProject: (orgId: string, id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: null,
  selectedProject: null,
  getAllProjects: async (orgId: string) => {
    try {
      const url = `/api/projects/${orgId}/get/all`;

      const response = await axiosClient.get(url);
      const data = response.data?.data?.data ?? [];

      set({ projects: data });
    } catch (error) {
      console.log(error);
      set({ projects: [] });
    }
  },
  getProject: async (orgId: string, id: string) => {
    try {
      const url = `/api/projects/${orgId}/get/${id}`;

      const response = await axiosClient.get(url);
      const data = response.data?.data ?? null;

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  getProjectDetails: async (orgId: string, id: string) => {
    try {
      const url = `/api/projects/${orgId}/get/${id}/details`;

      const response = await axiosClient.get(url);
      const data = response.data?.data ?? null;

      set({ selectedProject: data });
    } catch (error) {
      console.log(error);
    }
  },
  createProject: async (orgId: string, payload: CreateProjectInterface) => {
    try {
      const url = `/api/projects/${orgId}/create`;

      const response = await axiosClient.post(url, payload);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllProjects(orgId);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
  deleteProject: async (orgId: string, id: string) => {
    try {
      const url = `/api/projects/${orgId}/delete/${id}`;

      const response = await axiosClient.delete(url);
      const data = response.data?.data ?? null;

      if (data) {
        get().getAllProjects(orgId);
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  },
}));
