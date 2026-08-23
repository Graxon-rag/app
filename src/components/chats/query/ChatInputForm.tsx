import React, { useState, useRef, useCallback } from "react";
import { Send, Loader2, FileText } from "lucide-react";
import { MentionsInput, Mention, SuggestionDataItem } from "react-mentions";
import { useParams } from "react-router-dom";
import { useDocumentStore } from "@/store/documentStore";

interface ChatInputFormProps {
  inputQuery: string;
  setInputQuery: (val: string) => void;
  handleSearch: (cleanQuery: string, mentionedDocId?: string) => void;
  isFetching: boolean;
}

export function ChatInputForm({
  inputQuery,
  setInputQuery,
  handleSearch,
  isFetching,
}: ChatInputFormProps) {
  const { org_id, project_id } = useParams<{ org_id: string; project_id: string }>();
  const [isSearching, setIsSearching] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  // Hook into your Document Store
  const getAllDocuments = useDocumentStore((state) => state.getAllDocuments);

  // --- Fetch Documents for Mention ---
  const fetchDocuments = useCallback(
    (query: string, callback: (data: SuggestionDataItem[]) => void) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        abortController.current?.abort();
        const controller = new AbortController();
        abortController.current = controller;

        if (!org_id || !project_id) {
          callback([]);
          return;
        }

        setIsSearching(true);

        try {
          // Fetch using your Zustand store action
          await getAllDocuments(org_id, project_id, { name: query, limit: 10 });

          // Bail out early if the user kept typing and fired a newer request
          if (abortController.current !== controller) return;

          // Grab the newly populated documents directly from the store state
          const docs = useDocumentStore.getState().documents || [];

          // Map them to react-mentions format
          const results = docs.map((doc: any) => ({
            id: doc.id,
            display: doc.name,
            type: doc.type, // Custom property for the icon
          }));

          callback(results);
        } catch (err: any) {
          if (err.name === "CanceledError" || err.message === "canceled") return;
          console.error("Document search failed:", err);
          callback([]);
        } finally {
          if (abortController.current === controller) {
            setIsSearching(false);
          }
        }
      }, 250); // 250ms debounce
    },
    [org_id, project_id, getAllDocuments],
  );

  // --- Render Suggestion Item ---
  const renderSuggestion = (
    suggestion: SuggestionDataItem,
    search: string,
    highlightedDisplay: React.ReactNode,
  ) => {
    const doc = suggestion as SuggestionDataItem & { type?: string };
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-700 dark:text-zinc-200">
        <FileText size={14} className="text-primary-500 shrink-0" />
        <span className="truncate">{highlightedDisplay}</span>
      </div>
    );
  };

  // --- Handle Submit & Parse Mention ---
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isFetching) return;

    // Extract the ID from react-mentions markup: @[Display Name](doc_id)
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    let matchedDocId: string | undefined = undefined;

    // Replace the markup with just the document name so the LLM gets a clean query string
    const cleanQuery = inputQuery.replace(mentionRegex, (match, display, id) => {
      matchedDocId = id; // Grabs the last mentioned document ID
      return display;
    });

    handleSearch(cleanQuery, matchedDocId);
  };

  return (
    <form onSubmit={onSubmit} className="relative w-full shrink-0">
      <div className="relative w-full rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
        <MentionsInput
          value={inputQuery}
          onChange={(e, newValue) => setInputQuery(newValue)}
          placeholder="Ask a question... type @ to mention a specific document"
          disabled={isFetching}
          className="w-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
          style={mentionsInputStyle}
          a11ySuggestionsListLabel="Matching documents"
        >
          <Mention
            trigger="@"
            markup="@[__display__](__id__)"
            displayTransform={(id, display) => `@${display}`}
            data={fetchDocuments}
            renderSuggestion={renderSuggestion}
            appendSpaceOnAdd
            style={{ backgroundColor: "rgba(99, 102, 241, 0.15)", borderRadius: "4px" }}
          />
        </MentionsInput>

        <button
          type="submit"
          disabled={isFetching || !inputQuery.trim()}
          className="absolute right-2 bottom-1.5 p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 hover:opacity-90 transition cursor-pointer z-10"
        >
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>

      {isSearching && (
        <span className="absolute -top-6 left-2 text-xs font-semibold text-zinc-400 flex items-center gap-1 animate-pulse">
          <Loader2 size={10} className="animate-spin" /> Searching documents...
        </span>
      )}
    </form>
  );
}

// React-Mentions requires inline styles to look nice out-of-the-box
const mentionsInputStyle = {
  control: {
    fontSize: 14,
    fontWeight: "normal",
  },
  highlighter: {
    padding: "14px 48px 14px 16px",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  input: {
    padding: "14px 48px 14px 16px",
    margin: 0,
    border: 0,
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "transparent",
  },
  suggestions: {
    list: {
      backgroundColor: "var(--tw-colors-white, #ffffff)",
      border: "1px solid var(--tw-colors-zinc-200, #e4e4e7)",
      fontSize: 14,
      borderRadius: "0.75rem",
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      overflow: "hidden",
      width: "100%",
      maxHeight: "300px",
      overflowY: "auto" as const,
    },
    item: {
      padding: 0,
      borderBottom: "1px solid var(--tw-colors-zinc-100, #f4f4f5)",
    },
  },
};
