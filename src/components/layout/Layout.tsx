import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex flex-col flex-1 min-h-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-17.5" : "ml-64"
        }`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div
            className={`${isSidebarCollapsed ? "px-2" : "px-6"} py-6 w-full mx-auto animate-fade-in`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
