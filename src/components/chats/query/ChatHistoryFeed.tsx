import React, { useRef } from "react";
import { ChatMessageGetInterface } from "@/interfaces/ChatMessageInterface";
import ChatMessageItem from "./ChatMessageItem";

interface ChatHistoryFeedProps {
  messages: ChatMessageGetInterface[];
  onLoadMore: () => void;
  hasMore: boolean;
}

export function ChatHistoryFeed({ messages, onLoadMore, hasMore }: ChatHistoryFeedProps) {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    // When scrolling hits the top, load more historical messages
    if (scrollTop === 0 && hasMore) {
      onLoadMore();
    }
  };

  return (
    <div
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto flex flex-col-reverse py-4 px-2 space-y-4 space-y-reverse"
    >
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}
    </div>
  );
}
