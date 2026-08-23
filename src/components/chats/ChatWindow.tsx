import { useSearchParams } from "react-router-dom";
import { MessageSquarePlus, PanelLeft } from "lucide-react";
import ChatQueryContainer from "./query/ChatQueryContainer";

interface ChatWindowProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function ChatWindow({ isSidebarOpen, toggleSidebar }: ChatWindowProps) {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chat_id");

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 bg-white dark:bg-[#0a0a0a] relative">
        {/* Toggle Button for Empty State */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <PanelLeft size={20} />
          </button>
        )}
        <MessageSquarePlus size={48} strokeWidth={1.5} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">
          Select a chat or start a new one to begin conversation
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <ChatQueryContainer isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  );
}
