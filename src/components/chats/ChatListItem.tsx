import { useState } from "react";
import { MessageSquare, MoreVertical, Pencil, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChatGetInterface } from "@/interfaces/ChatInterface";

interface ChatListItemProps {
  chat: ChatGetInterface;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}

export default function ChatListItem({
  chat,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: ChatListItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(chat.name);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name !== chat.name) {
      onRename(name);
    }
    setIsRenaming(false);
  };

  return (
    <div
      onClick={!isRenaming ? onSelect : undefined}
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
      }`}
    >
      <div className="flex items-center gap-2.5 truncate flex-1">
        <MessageSquare size={16} className="flex-shrink-0" />
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setIsRenaming(false)}
              className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-1.5 py-0.5 text-xs rounded outline-none w-full"
            />
          </form>
        ) : (
          <span className="truncate text-sm">{chat.name}</span>
        )}
      </div>

      {/* Radix Dropdown for Actions */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 cursor-pointer p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-opacity"
          >
            <MoreVertical size={14} />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[120px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-md p-1 z-50 text-xs"
            sideOffset={5}
          >
            <DropdownMenu.Item
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer outline-none"
            >
              <Pencil size={12} /> Rename
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 cursor-pointer outline-none"
            >
              <Trash2 size={12} /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
