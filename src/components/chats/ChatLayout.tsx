import React, { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

export default function ChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-[calc(100vh-140px)] w-full border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-[#0a0a0a] relative shadow-sm">
      {/* Sidebar Area with smooth width transition */}
      <div
        className={`transition-all duration-300 ease-in-out shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 ${
          isSidebarOpen ? "w-72" : "w-0 border-none opacity-0"
        }`}
      >
        <div className="w-72 h-full overflow-hidden">
          <ChatSidebar />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <ChatWindow
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  );
}
