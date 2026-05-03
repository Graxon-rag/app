import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function Layout() {
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <div
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 w-full mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
