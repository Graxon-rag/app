import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Send, Loader2, FileText, AtSign, X } from "lucide-react";
import { MentionsInput, Mention, SuggestionDataItem } from "react-mentions";
import { useParams } from "react-router-dom";
import { useDocumentStore } from "@/store/documentStore";

interface ChatInputFormProps {
  inputQuery: string;
  setInputQuery: (val: string) => void;
  handleSearch: (cleanQuery: string, mentionedDocId?: string) => void;
  isFetching: boolean;
}

const HINT_DISMISSED_KEY = "chat-mention-hint-dismissed";

// Watches the `dark` class on <html> (adjust target if your app toggles
// dark mode differently) so we can resolve real colors for react-mentions'
// inline styles. CSS variables are unreliable here since react-mentions
// applies these as inline styles on elements we don't control the mounting
// of, so var() inheritance can silently fail.
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function ChatInputForm({
  inputQuery,
  setInputQuery,
  handleSearch,
  isFetching,
}: ChatInputFormProps) {
  const { org_id, project_id } = useParams<{ org_id: string; project_id: string }>();
  const [isSearching, setIsSearching] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(true);
  const isDark = useIsDarkMode();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setHintDismissed(sessionStorage.getItem(HINT_DISMISSED_KEY) === "true");
  }, []);

  const dismissHint = () => {
    sessionStorage.setItem(HINT_DISMISSED_KEY, "true");
    setHintDismissed(true);
  };

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const getAllDocuments = useDocumentStore((state) => state.getAllDocuments);

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
          await getAllDocuments(org_id, project_id, { name: query, limit: 10 });
          if (abortController.current !== controller) return;

          const docs = useDocumentStore.getState().documents || [];
          const results = docs.map((doc: any) => ({
            id: doc.id,
            display: doc.name,
            type: doc.type,
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
      }, 250);
    },
    [org_id, project_id, getAllDocuments],
  );

  const renderSuggestion = (
    suggestion: SuggestionDataItem,
    search: string,
    highlightedDisplay: React.ReactNode,
    index: number,
    focused: boolean,
  ) => {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors ${
          focused
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            : "bg-transparent text-zinc-700 dark:text-zinc-300"
        }`}
      >
        <FileText
          size={14}
          className={`shrink-0 ${focused ? "text-primary-600 dark:text-primary-400" : "text-zinc-400"}`}
        />
        <span className="truncate">{highlightedDisplay}</span>
      </div>
    );
  };

  // Extracted so both the form's normal onSubmit (click / native Enter)
  // and the Ctrl+Enter shortcut call the exact same logic.
  const submitQuery = useCallback(() => {
    if (!inputQuery.trim() || isFetching) return;

    // Matches @[display](id) markup produced by react-mentions
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    let matchedDocId: string | undefined = undefined;

    // Strip the mention out entirely rather than replacing it with the
    // filename — the doc is passed separately via matchedDocId, it
    // shouldn't also end up as text in the query sent to the backend.
    const cleanQuery = inputQuery
      .replace(mentionRegex, (match, display, id) => {
        matchedDocId = id;
        return "";
      })
      .replace(/\s{2,}/g, " ") // collapse leftover double spaces
      .trim();

    handleSearch(cleanQuery, matchedDocId);
  }, [inputQuery, isFetching, handleSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery();
  };

  // Capture phase so this runs BEFORE react-mentions' own internal keydown
  // handling (e.g. its Enter/Tab/arrow handling for the suggestions list),
  // which means Ctrl+Enter works reliably even while the @ dropdown is open.
  const handleKeyDownCapture = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      submitQuery();
    }
  };

  // Resolved (non-CSS-var) styles so the suggestions dropdown always
  // matches the active theme regardless of where react-mentions mounts it.
  const mentionsInputStyle = useMemo(() => getMentionsInputStyle(isDark), [isDark]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="relative w-full shrink-0">
      {/* Dismissible hint for the @ mention feature — resets each new tab/session */}
      {!hintDismissed && (
        <div className="flex items-center justify-between gap-2 mb-2 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20 text-xs text-primary-700 dark:text-primary-300">
          <span className="flex items-center gap-1.5">
            <AtSign size={12} className="shrink-0" />
            Type <kbd className="px-1 py-0.5 rounded bg-primary-500/15 font-mono">@</kbd> to ask
            about a specific document
          </span>
          <button
            type="button"
            onClick={dismissHint}
            aria-label="Dismiss hint"
            className="shrink-0 p-0.5 rounded hover:bg-primary-500/15 transition cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div
        onKeyDownCapture={handleKeyDownCapture}
        className="relative w-full rounded-xl border shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 transition-all 
        bg-white dark:bg-zinc-900 
        border-zinc-200 dark:border-zinc-800
      "
      >
        <MentionsInput
          value={inputQuery}
          onChange={(e, newValue) => setInputQuery(newValue)}
          placeholder="Ask a question... type @ to mention a specific document (Ctrl+Enter to send)"
          disabled={isFetching}
          className="w-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 mentions-flip-up"
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
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              color: "inherit",
              borderRadius: "4px",
            }}
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

      {/* 
        react-mentions positions its suggestion list absolutely, anchored
        below the caret, with no viewport-aware flipping. Since this input
        sits at the bottom of the chat, force the dropdown to open upward
        and give it more visible height. !important is required because
        the library sets top/bottom via inline style.
      */}
      <style>{`
        .mentions-flip-up > div:last-child {
          top: auto !important;
          bottom: 100% !important;
          margin-bottom: 8px;
        }
      `}</style>
    </form>
  );
}

function getMentionsInputStyle(isDark: boolean) {
  return {
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
      color: "inherit",
    },
    suggestions: {
      list: {
        backgroundColor: isDark ? "#18181b" : "#ffffff", // zinc-900 / white — resolved directly, no CSS var
        border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`, // zinc-800 / zinc-200
        color: isDark ? "#f4f4f5" : "#18181b",
        fontSize: 14,
        borderRadius: "0.75rem",
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        overflow: "hidden",
        width: "100%",
        maxHeight: "260px",
        overflowY: "auto" as const,
        marginTop: "-4px",
      },
      item: {
        padding: 0,
      },
    },
  };
}
