import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { MessageSquarePlus } from "lucide-react";
import ChatMessageItem from "./ChatMessageItem";
import { useChatMessageStore } from "@/store/chatMessageStore";

export default function ChatWindow() {
  const { org_id, project_id } = useParams();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chat_id");

  const { messages, listMessages, pagination } = useChatMessageStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (org_id && project_id && chatId) {
      listMessages(org_id, project_id, chatId, 1, 20);
    }
  }, [org_id, project_id, chatId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && pagination.current_page < pagination.total_pages && chatId) {
      listMessages(org_id!, project_id!, chatId, pagination.current_page + 1, 20);
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 bg-white dark:bg-zinc-950">
        <MessageSquarePlus size={48} strokeWidth={1.5} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">
          Select a chat or start a new one to begin conversation
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-6 flex flex-col-reverse"
      >
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto">
          <input
            type="text"
            disabled
            placeholder="Type your message here... (Input action coming soon)"
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed outline-none"
          />
        </div>
      </div>
    </div>
  );
}
