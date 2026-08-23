import { PaginationInterface } from "./CommonInterface";

export interface ChatCreateInterface {
  id: string;
  name?: string;
}

export interface ChatUpdateInterface {
  name: string;
}

export interface ChatGetInterface {
  id: string;
  org_id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ChatListInterface {
  data: ChatGetInterface[];
  pagination?: PaginationInterface | null;
}
