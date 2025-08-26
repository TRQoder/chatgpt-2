import { Plus, Trash2 } from "lucide-react";
import { classNames } from "../utils/ui";

export default function Sidebar({
  conversations,
  activeId,
  setActiveId,
  createChat,
  deleteChat,
  theme,
  setTheme,
  sidebarOpen,
}) {
  return (
    <aside
      className={classNames(
        "border-r border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:dark:bg-zinc-900/40",
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-72" : "w-0"
      )}
    >
      <div
        className={classNames(
          "h-full",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          "transition-opacity duration-300"
        )}
      >
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            onClick={createChat}
            aria-label="New chat"
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">New chat</span>
          </button>
          {/* <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button> */}
        </div>
        <div className="px-2 pb-4 overflow-y-auto h-[calc(100dvh-4rem)]">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={classNames(
                "group flex items-center justify-between gap-2 rounded-xl px-3 py-2 mb-1 cursor-pointer",
                c.id === activeId
                  ? "bg-zinc-100 dark:bg-zinc-800"
                  : "hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
              )}
            >
              <button onClick={() => setActiveId(c.id)} className="flex-1 text-left truncate text-sm">
                {c.title}
              </button>
              <button
                onClick={() => deleteChat(c.id)}
                aria-label="Delete chat"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
