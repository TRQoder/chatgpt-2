import { Plus, Trash2, LogOut } from "lucide-react";
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
  onLogout,
}) {
  return (
    <aside
      className={classNames(
        "border-r border-zinc-200 dark:border-zinc-800",
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-72" : "w-0"
      )}
    >
      <div
        className={classNames(
          "h-full flex flex-col", // <-- make it column layout
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          "transition-opacity duration-300"
        )}
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            onClick={createChat}
            aria-label="New chat"
              onMouseDown={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 select-none"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">New chat</span>
          </button>
        </div>

        {/* Conversations list (scrollable) */}
        <div className="px-2 pb-4 overflow-y-auto flex-1">
          {conversations.map((c) => (
            <div
              key={c._id}
              onClick={() => setActiveId(c._id)}
              className={classNames(
                "group flex items-center justify-between gap-2 rounded-xl px-3 py-2 mb-1 cursor-pointer",
                c._id === activeId
                  ? "bg-zinc-100 dark:bg-zinc-800"
                  : "hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
              )}
            >
              <button
                onMouseDown={(e) => e.preventDefault()}
                className="flex-1 text-left truncate text-sm select-none"
              >
                {c.title}
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => deleteChat(c._id)}
                aria-label="Delete chat"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 select-none"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer (Logout button) */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onLogout}
            className="w-full flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 select-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
