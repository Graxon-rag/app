import React from "react";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessageGetInterface } from "@/interfaces/ChatMessageInterface";

interface ChatMessageItemProps {
  message: ChatMessageGetInterface;
}

export default function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 max-w-4xl w-full ${isUser ? "flex-row-reverse self-end" : "flex-row self-start"} mb-4`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-primary-600 text-white"
            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[85%]`}>
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-primary-600 text-white rounded-tr-none"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-800 prose prose-zinc dark:prose-invert max-w-none"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.message}</p>
          ) : (
            <ReactMarkdown>{message.message}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
