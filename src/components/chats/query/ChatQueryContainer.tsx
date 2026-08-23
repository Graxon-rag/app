import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQueryStore } from "@/store/queryStore";
import { useChatMessageStore } from "@/store/chatMessageStore"; // Adjust path
import { QueryType, QueryDepth, QueryResponse } from "@/interfaces/QueryInterface";

import { ChatSettingsBar } from "./ChatSettingsBar";
import { ChatInputForm } from "./ChatInputForm";
import { ChatHistoryFeed } from "./ChatHistoryFeed";
import { ChatLiveResponse } from "./ChatLiveResponse";

interface ChatQueryContainerProps {
  doc_id?: string | null;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function ChatQueryContainer({
  doc_id: propDocId,
  isSidebarOpen,
  toggleSidebar,
}: ChatQueryContainerProps) {
  const { org_id, project_id } = useParams<{ org_id: string; project_id: string }>();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chat_id");
  const doc_id = propDocId || null;

  // Stores
  const {
    query,
    isLoading,
    isStreaming,
    streamedAnswer,
    streamedThinking,
    toolSteps,
    clearStream,
  } = useQueryStore();
  const { messages, listMessages, pagination } = useChatMessageStore();

  // Local State
  const [inputQuery, setInputQuery] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [queryType, setQueryType] = useState<QueryType>(QueryType.SMART);
  const [queryDepth, setQueryDepth] = useState<QueryDepth>(QueryDepth.ADVANCED);
  const [topK, setTopK] = useState<number>(5);
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(true);

  // === 1. CLEAR CACHE & LOAD MESSAGES ON CHAT ID CHANGE ===
  useEffect(() => {
    // Clear live response and streams when switching chats
    setResponse(null);
    clearStream();
    setInputQuery("");

    // Load page 1 of history for the new chat
    if (org_id && project_id && chatId) {
      listMessages(org_id, project_id, chatId, 1, 20);
    }
  }, [chatId, org_id, project_id, clearStream, listMessages]);

  const handleLoadMoreHistory = () => {
    if (org_id && project_id && chatId && pagination.current_page < pagination.total_pages) {
      listMessages(org_id, project_id, chatId, pagination.current_page + 1, 20);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || !org_id || !project_id) return;

    setResponse(null);
    const currentQuery = inputQuery;
    setInputQuery(""); // Clear input early for better UX

    const data = await query({
      org_id,
      project_id,
      chat_id: chatId || undefined,
      query: currentQuery,
      document_id: doc_id,
      top_k: topK,
      query_type: queryType,
      query_depth: queryDepth,
      thinking: isThinkingMode,
    });

    if (data) {
      setResponse(data as QueryResponse);
      // Optional: Refresh the message list after generating an answer to append the saved records
      if (chatId) {
        listMessages(org_id, project_id, chatId, 1, 20);
      }
      setResponse(null);
      clearStream();
    }
  };

  const isFetching = isLoading || isStreaming;
  const displayAnswer = isThinkingMode ? streamedAnswer || response?.answer : response?.answer;
  const hasMoreHistory = pagination.current_page < pagination.total_pages;

  return (
    <div className="flex flex-col h-full w-full py-2 md:py-3 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Settings Bar */}
      <div className="shrink-0">
        <ChatSettingsBar
          chatId={chatId}
          queryType={queryType}
          setQueryType={setQueryType}
          queryDepth={queryDepth}
          setQueryDepth={setQueryDepth}
          topK={topK}
          setTopK={setTopK}
          isThinkingMode={isThinkingMode}
          setIsThinkingMode={setIsThinkingMode}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Historical Messages Feed (Scrollable) */}
      <ChatHistoryFeed
        messages={messages}
        onLoadMore={handleLoadMoreHistory}
        hasMore={hasMoreHistory}
      />

      {/* Live / Currently Processing Response */}
      <ChatLiveResponse
        response={response}
        isStreaming={isStreaming}
        displayAnswer={displayAnswer}
        streamedThinking={streamedThinking}
        toolSteps={toolSteps}
        isThinkingMode={isThinkingMode}
      />

      {/* Input Form at the bottom */}
      <div className="shrink-0 m-4">
        <ChatInputForm
          inputQuery={inputQuery}
          setInputQuery={setInputQuery}
          handleSearch={handleSearch}
          isFetching={isFetching}
        />
      </div>
    </div>
  );
}
