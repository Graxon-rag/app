import { Bot, User } from "lucide-react";
import { ChatMessageGetInterface } from "@/interfaces/ChatMessageInterface";

interface ChatMessageItemProps {
  message: ChatMessageGetInterface;
}

export default function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 max-w-3xl mx-auto my-4 w-full px-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? "bg-primary-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        <div
          className={`p-3.5 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-primary-600 text-white rounded-tr-none" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-700/50"}`}
        >
          {message.message}
        </div>
      </div>
    </div>
  );
}
