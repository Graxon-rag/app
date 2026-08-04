import { create } from "zustand";
import {
  CreateProjectInterface,
  ProjectInterface,
  ProjectDetailInterface,
  ProjectConfigGetInterface,
  ProjectConfigUpdateInterface,
} from "@/interfaces/ProjectInterface";
import { axiosClient } from "@/utils/axiosClient";

interface ProjectStore {
  projects: ProjectInterface[] | null;
  selectedProject: ProjectInterface | null;
  getAllProjects: (orgId: string) => Promise<void>;
  getProject: (orgId: string, id: string) => Promise<void>;
  getProjectDetails: (orgId: string, id: string) => Promise<void>;
  createProject(orgId: string, payload: CreateProjectInterface): Promise<void>;
  deleteProject: (orgId: string, id: string) => Promise<void>;
  getProjectConfigByProject: (
    orgId: string,
    projectId: string,
  ) => Promise<ProjectConfigGetInterface>;
  updateProjectConfig: (
    orgId: string,
    projectId: string,
    configId: string,
    payload: ProjectConfigUpdateInterface,
  ) => Promise<ProjectConfigGetInterface>;
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
      set({ selectedProject: data });
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
  getProjectConfigByProject: async (orgId: string, projectId: string) => {
    const url = `/api/projects-configs/${orgId}/${projectId}`;

    const response = await axiosClient.get(url);
    const data = response.data?.data ?? null;

    return data;
  },
  updateProjectConfig: async (
    orgId: string,
    projectId: string,
    configId: string,
    config: ProjectConfigUpdateInterface,
  ) => {
    try {
      const url = `/api/projects-configs/${orgId}/${projectId}/update/${configId}`;

      const response = await axiosClient.put(url, config);
      const data = response.data?.data ?? null;

      return data;
    } catch (error) {
      console.log(error);
    }
  },
}));
