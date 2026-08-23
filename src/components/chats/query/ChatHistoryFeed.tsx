import React, { useEffect, useRef, useState } from "react";
import { ChatMessageGetInterface } from "@/interfaces/ChatMessageInterface"; // Adjust path if needed
import ChatMessageItem from "./ChatMessageItem";

interface ChatHistoryFeedProps {
  messages: ChatMessageGetInterface[];
  onLoadMore: () => void;
  hasMore: boolean;
}

export function ChatHistoryFeed({ messages, onLoadMore, hasMore }: ChatHistoryFeedProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Local state to lock the fetch so it only triggers once per page
  const [isLoading, setIsLoading] = useState(false);
  const prevMessageCount = useRef(messages.length);

  // 1. Release the loading lock when new messages arrive from the backend
  useEffect(() => {
    if (messages.length !== prevMessageCount.current) {
      setIsLoading(false);
      prevMessageCount.current = messages.length;
    }
  }, [messages.length]);

  // 2. Set up the Intersection Observer
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // If the sentinel comes into view and we aren't already loading...
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          onLoadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "100px", // Trigger 100px before they actually hit the absolute top
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
      {/* 
        In flex-col-reverse, elements are visually bottom-to-top.
        The first element maps to the visual bottom (newest). 
      */}
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}

      {/* 
        This sentinel sits at the end of the list, which means it sits 
        at the VISUAL TOP of the chat. 
      */}
      <div ref={sentinelRef} className="h-1 w-full shrink-0 opacity-0 pointer-events-none" />

      {/* Optional: A small loading spinner when fetching older history */}
      {isLoading && (
        <div className="w-full text-center py-2 text-xs font-medium text-zinc-400 shrink-0">
          Loading messages...
        </div>
      )}
    </div>
  );
}
