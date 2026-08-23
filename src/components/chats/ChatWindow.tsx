import { useSearchParams } from "react-router-dom";
import { MessageSquarePlus } from "lucide-react";
import ChatQueryContainer from "./query/ChatQueryContainer"; // Import your query container

export default function ChatWindow() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chat_id");

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
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 overflow-y-auto px-6">
      {/* Call the main interactive chat query view here */}
      <ChatQueryContainer />
    </div>
  );
}
