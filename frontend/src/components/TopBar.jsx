import React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function TopBar({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className="h-14 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:dark:bg-zinc-900/40 sticky top-0 z-10">
      <div className="h-full px-3 md:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>
          <span className="font-medium">ChatGPT</span>
        </div>
        <div className="hidden md:flex items-center gap-2"></div>
      </div>
    </div>
  );
}
