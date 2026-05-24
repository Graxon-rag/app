import { UploadPart, UploadSession } from "@/interfaces/MultipartInterface";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MultipartUploadStore {
  // filename -> UploadSession
  sessions: Record<string, UploadSession>;
  getSession: (filename: string) => UploadSession | null;
  setSession: (filename: string, documentId: string, uploadId: string, key: string) => void;
  addPart: (filename: string, part: UploadPart) => void;
  deleteSession: (filename: string) => void;
}

export const useMultipartUploadStore = create<MultipartUploadStore>()(
  persist(
    (set, get) => ({
      sessions: {},

      getSession: (filename) => {
        return get().sessions[filename] ?? null;
      },

      setSession: (filename, documentId, uploadId, key) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [filename]: {
              uploadId,
              documentId,
              key,
              completedParts: state.sessions[filename]?.completedParts ?? [],
            },
          },
        }));
      },

      addPart: (filename, part) => {
        set((state) => {
          const session = state.sessions[filename];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [filename]: {
                ...session,
                completedParts: [...session.completedParts, part],
              },
            },
          };
        });
      },

      deleteSession: (filename) => {
        set((state) => {
          const updated = { ...state.sessions };
          delete updated[filename];
          return { sessions: updated };
        });
      },
    }),
    { name: "multipart-upload-storage" },
  ),
);
