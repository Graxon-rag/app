import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import ChatListItem from "./ChatListItem";
import { useChatStore } from "@/store/chatStore";

export default function ChatSidebar() {
  const { org_id, project_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeChatId = searchParams.get("chat_id");

  const { chats, listChats, createChat, renameChat, deleteChat, pagination } = useChatStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (org_id && project_id) {
      listChats(org_id, project_id, 1, 20);
    }
  }, [org_id, project_id]);

  const handleNewChat = async () => {
    if (!org_id || !project_id) return;
    const newId = crypto.randomUUID();
    await createChat(org_id, project_id, { id: newId, name: "New Chat" });

    // Set tab to chats and select the new chat ID in query params
    setSearchParams({ tab: "chats", chat_id: newId });
  };

  const handleSelectChat = (chatId: string) => {
    setSearchParams({ tab: "chats", chat_id: chatId });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      if (pagination.current_page < pagination.total_pages) {
        listChats(org_id!, project_id!, pagination.current_page + 1, 20);
      }
    }
  };

  return (
    <aside className=" border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={16} /> New Chat
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 space-y-1"
      >
        {chats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={chat.id === activeChatId}
            onSelect={() => handleSelectChat(chat.id)}
            onRename={(newName) => renameChat(org_id!, project_id!, chat.id, { name: newName })}
            onDelete={() => {
              deleteChat(org_id!, project_id!, chat.id);
              if (chat.id === activeChatId) {
                // Clear chat_id from search params if deleted
                setSearchParams({ tab: "chats" });
              }
            }}
          />
        ))}
      </div>
    </aside>
  );
}
