import React from "react";
import { Bot, User, Zap, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessageGetInterface } from "@/interfaces/ChatMessageInterface";
import { Collapsible } from "./Collapsible";
import { ChunkCard } from "./ChunkCard";
import { LexicalAnalysisPanel } from "./LexicalAnalysisPanel";

interface ChatMessageItemProps {
  message: ChatMessageGetInterface;
}

export default function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const meta = message.chat_metadata as any; // Extract metadata saved from backend

  const hasChunks = meta?.chunks && meta.chunks.length > 0;
  const hasLexicalAnalysis = !!meta?.lexical_engine_analysis;

  return (
    <div
      className={`flex gap-3 max-w-5xl w-full ${isUser ? "flex-row-reverse self-end" : "flex-row self-start"} mb-6`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
          isUser
            ? "bg-primary-600 text-white"
            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full max-w-[85%]`}>
        {/* Chat Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed w-full ${
            isUser
              ? "bg-primary-600 text-white rounded-tr-none w-auto inline-block"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-800 prose prose-zinc dark:prose-invert max-w-none"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.message}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styles for Markdown tables and text
                table: ({ children }) => (
                  <div className="overflow-x-auto w-full my-4">
                    <table className="min-w-full border-collapse border border-zinc-300 dark:border-zinc-700 text-sm">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-3 py-2 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-zinc-300 dark:border-zinc-700 px-3 py-2 align-top">
                    {children}
                  </td>
                ),
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
                ),
                li: ({ children }) => <li className="leading-6">{children}</li>,
              }}
            >
              {message.message}
            </ReactMarkdown>
          )}
        </div>

        {/* Historical Metadata (Sources & Lexical) */}
        {!isUser && (hasChunks || hasLexicalAnalysis) && (
          <div className="mt-3 w-full space-y-3">
            {hasChunks && (
              <Collapsible
                label="Grounded Sources"
                icon={<Zap size={14} />}
                badge={meta.chunks.length}
                defaultOpen={false}
              >
                <div className="space-y-3 w-full max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {meta.chunks.map((chunk: any, index: number) => (
                    <ChunkCard key={chunk.chunk_id || index} chunk={chunk} index={index} />
                  ))}
                </div>
              </Collapsible>
            )}

            {hasLexicalAnalysis && (
              <Collapsible
                label="Lexical Engine Analysis"
                icon={<Search size={14} />}
                defaultOpen={false}
              >
                <LexicalAnalysisPanel analysis={meta.lexical_engine_analysis} />
              </Collapsible>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
