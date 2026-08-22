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

interface QueryStore {
  // Standard loading state
  isLoading: boolean;
  // Streaming specific states
  isStreaming: boolean;
  streamedAnswer: string;
  streamedThinking: string;
  toolSteps: ToolStep[];

  query: (payload: QueryInterface & { thinking?: boolean }) => Promise<QueryResponse | null>;
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

    if (!thinking) {
      set({ isLoading: true });
      try {
        const response = await axiosClient.get(
          `/api/query/${payload.org_id}/projects/${payload.project_id}?${urlParams}`,
        );
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
      const url = `${baseUrl}/api/query/${payload.org_id}/projects/${payload.project_id}?${urlParams}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          // Inherit Auth headers from Axios configuration if needed
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
          // IMPORTANT: eventData accumulates ALL "data:" lines in this chunk,
          // joined with "\n", per the SSE spec. A single event can legitimately
          // span multiple "data:" lines -- this is how multi-paragraph /
          // multi-line payloads (e.g. answer text with blank lines between
          // paragraphs) are transmitted safely, since a literal newline
          // inside one "data:" line would be indistinguishable from the
          // "\n\n" event terminator. The backend is expected to split any
          // payload with embedded newlines into one "data:" line per line
          // of content; this loop reassembles them in order.
          const dataLines: string[] = [];

          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              // Safe to trim: event names ("token", "thinking", "tool_call", ...)
              // never carry meaningful leading/trailing whitespace.
              eventType = line.substring(7).trim();
            } else if (line.startsWith("event:")) {
              eventType = line.substring(6).trim();
            } else if (line.startsWith("data: ")) {
              // DO NOT trim -- this is the actual payload content. Trimming
              // here silently deletes spaces/newlines between words and
              // paragraphs, which breaks both plain-text readability and
              // Markdown block structure (headings, lists, blank-line-
              // separated paragraphs).
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
            /* ignore JSON error for pure text -- eventData is used as-is,
               with its original whitespace and line breaks intact */
          }

          // Update store incrementally based on SSE type
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
            // Final payload from the chain
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
