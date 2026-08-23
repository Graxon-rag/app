import { create } from "zustand";
import { axiosClient } from "@/utils/axiosClient";
import { QueryDepth, QueryInterface, QueryResponse, QueryType } from "@/interfaces/QueryInterface";

export interface ToolStep {
  id: string;
  name: string;
  input: string;
  output: string;
  status: "running" | "done";
}

// Extend your query interface or handle it inline
export interface ChatQueryPayload extends QueryInterface {
  chat_id?: string;
  thinking?: boolean;
}

interface QueryStore {
  isLoading: boolean;
  isStreaming: boolean;
  streamedAnswer: string;
  streamedThinking: string;
  toolSteps: ToolStep[];

  query: (payload: ChatQueryPayload) => Promise<QueryResponse | null>;
  clearStream: () => void;
}

export const useQueryStore = create<QueryStore>((set, get) => ({
  isLoading: false,
  isStreaming: false,
  streamedAnswer: "",
  streamedThinking: "",
  toolSteps: [],

  clearStream: () =>
    set({
      streamedAnswer: "",
      streamedThinking: "",
      toolSteps: [],
      isStreaming: false,
    }),

  query: async (payload) => {
    if (!payload.query || payload.query.trim().length === 0) {
      return { answer: "Query cannot be empty." };
    }

    const queryType = payload.query_type ?? QueryType.SMART;
    const queryDepth = payload.query_depth ?? QueryDepth.STANDARD;
    const thinking = payload.thinking ?? false;

    // Construct URL parameters
    let urlParams = `query=${encodeURIComponent(payload.query)}&top_k=${payload.top_k}&query_type=${queryType}&query_depth=${queryDepth}&thinking=${thinking}`;
    if (payload.document_id && payload.document_id.trim() !== "") {
      urlParams += `&document_id=${payload.document_id}`;
    }

    // Determine the base route: Chat endpoint vs Project endpoint
    const endpointPath = payload.chat_id
      ? `/api/query/${payload.org_id}/projects/${payload.project_id}/chats/${payload.chat_id}`
      : `/api/query/${payload.org_id}/projects/${payload.project_id}`;

    if (!thinking) {
      set({ isLoading: true });
      try {
        const response = await axiosClient.get(`${endpointPath}?${urlParams}`);
        const result = response.data;
        if (result?.success) return result.data ?? { answer: "No answer found." };
        return { answer: result?.message ?? "No answer found." };
      } catch (error) {
        console.error("Query Error:", error);
        return { answer: "An error occurred while processing your query." };
      } finally {
        set({ isLoading: false });
      }
    }

    get().clearStream();
    set({ isStreaming: true });

    try {
      const baseUrl = axiosClient.defaults.baseURL || "";
      const url = `${baseUrl}${endpointPath}?${urlParams}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...(axiosClient.defaults.headers.common as any),
        },
      });

      if (!res.body) throw new Error("No readable stream available");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResponse: QueryResponse = { answer: "" };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let eventIndex;
        while ((eventIndex = buffer.indexOf("\n\n")) >= 0) {
          const chunk = buffer.slice(0, eventIndex);
          buffer = buffer.slice(eventIndex + 2);

          let eventType = "message";
          const dataLines: string[] = [];

          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.substring(7).trim();
            } else if (line.startsWith("event:")) {
              eventType = line.substring(6).trim();
            } else if (line.startsWith("data: ")) {
              dataLines.push(line.substring(6));
            } else if (line.startsWith("data:")) {
              dataLines.push(line.substring(5));
            }
          }

          const eventData = dataLines.join("\n");

          let parsedData: any = eventData;
          try {
            parsedData = JSON.parse(eventData);
          } catch (e) {
            /* ignore JSON error for pure text */
          }

          if (eventType === "thinking") {
            set((state) => ({
              streamedThinking: state.streamedThinking + (parsedData ?? ""),
            }));
          } else if (eventType === "token") {
            set((state) => ({
              streamedAnswer: state.streamedAnswer + (parsedData ?? ""),
            }));
          } else if (eventType === "tool_call") {
            set((state) => ({
              toolSteps: [
                ...state.toolSteps,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  name: parsedData.name,
                  input:
                    typeof parsedData.input === "object"
                      ? JSON.stringify(parsedData.input)
                      : String(parsedData.input || ""),
                  output: "",
                  status: "running",
                },
              ],
            }));
          } else if (eventType === "tool_result") {
            set((state) => {
              const newSteps = [...state.toolSteps];
              for (let i = newSteps.length - 1; i >= 0; i--) {
                if (newSteps[i].name === parsedData.name && newSteps[i].status === "running") {
                  newSteps[i] = { ...newSteps[i], output: parsedData.output, status: "done" };
                  break;
                }
              }
              return { toolSteps: newSteps };
            });
          } else if (eventType === "metadata") {
            finalResponse = {
              answer: get().streamedAnswer,
              metadata: parsedData.chunks || [],
              lexical_engine_analysis: parsedData.lexical_engine_analysis || undefined,
              lexical_engine_chunk_ids: parsedData.lexical_engine_chunk_ids || [],
            };
          } else if (eventType === "error") {
            console.error("Stream error event:", parsedData);
          }
        }
      }

      return finalResponse;
    } catch (error) {
      console.error("Streaming Error:", error);
      return null;
    } finally {
      set({ isStreaming: false });
    }
  },
}));
