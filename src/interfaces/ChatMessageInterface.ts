import { PaginationInterface } from "./CommonInterface";

export interface ChatMessageRole {
  USER: "user";
  ASSISTANT: "assistant";
}

export interface ChatMessageCreateInterface {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  message: string;
  chat_metadata?: Record<string, any>;
}

export interface ChatMessageGetInterface {
  id: string;
  chat_id: string;
  role: string;
  message: string;
  number: number;
  chat_metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageListInterface {
  data: ChatMessageGetInterface[];
  pagination?: PaginationInterface | null;
}
