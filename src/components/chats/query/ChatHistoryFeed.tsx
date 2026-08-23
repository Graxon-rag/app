import React, { useEffect, useRef, useState } from "react";
import { ChatMessageGetInterface } from "@/interfaces/ChatMessageInterface";
import ChatMessageItem from "./ChatMessageItem";

interface ChatHistoryFeedProps {
  messages: ChatMessageGetInterface[];
  onLoadMore: () => void;
  hasMore: boolean;
}

export function ChatHistoryFeed({ messages, onLoadMore, hasMore }: ChatHistoryFeedProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Release the loading lock whenever the messages array updates from the backend
  // Since Zustand creates a new array reference on every fetch, this will reliably unlock
  // even if the message count stays exactly the same.
  useEffect(() => {
    setIsLoading(false);
  }, [messages]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          onLoadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto flex flex-col-reverse py-4 px-2 space-y-4 space-y-reverse custom-scrollbar"
    >
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}

      {hasMore && (
        <div ref={sentinelRef} className="h-1 w-full shrink-0 opacity-0 pointer-events-none" />
      )}

      {isLoading && hasMore && (
        <div className="w-full text-center py-2 text-xs font-medium text-zinc-400 shrink-0">
          Loading messages...
        </div>
      )}
    </div>
  );
}
