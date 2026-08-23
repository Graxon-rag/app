import React from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputFormProps {
  inputQuery: string;
  setInputQuery: (val: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isFetching: boolean;
}

export function ChatInputForm({
  inputQuery,
  setInputQuery,
  handleSearch,
  isFetching,
}: ChatInputFormProps) {
  return (
    <form onSubmit={handleSearch} className="relative w-full shrink-0">
      <input
        type="text"
        placeholder="Ask a question in this chat...."
        value={inputQuery}
        onChange={(e) => setInputQuery(e.target.value)}
        disabled={isFetching}
        className="w-full pl-4 pr-12 py-3.5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder-zinc-400 dark:placeholder-zinc-500 transition"
      />
      <button
        type="submit"
        disabled={isFetching || !inputQuery.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 hover:opacity-90 transition cursor-pointer"
      >
        {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </button>
    </form>
  );
}
