import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Send,
  Plus,
  Bot,
  User,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// --- Utilities ---
function classNames(...cls) {
  return cls.filter(Boolean).join(" ");
}

function useAutoResize(ref, { minRows = 1, maxRows = 6 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = () => {
      el.rows = minRows;
      const computed = window.getComputedStyle(el);
      const lineHeight = parseFloat(computed.lineHeight || "20");
      const border =
        parseFloat(computed.borderTopWidth || "0") +
        parseFloat(computed.borderBottomWidth || "0");
      const padding =
        parseFloat(computed.paddingTop || "0") +
        parseFloat(computed.paddingBottom || "0");
      const contentHeight = el.scrollHeight - padding - border;
      const rows = Math.min(
        maxRows,
        Math.max(minRows, Math.ceil(contentHeight / lineHeight))
      );
      el.rows = rows;
    };
    resize();
    el.addEventListener("input", resize);
    window.addEventListener("resize", resize);
    return () => {
      el.removeEventListener("input", resize);
      window.removeEventListener("resize", resize);
    };
  }, [ref, minRows, maxRows]);
}

function formatTitle(text, limit = 28) {
  return text.length > limit ? text.slice(0, limit) + "…" : text;
}

const starterConversations = [
  {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Hi! I’m your AI assistant. Ask me anything ✨",
      },
    ],
  },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const [conversations, setConversations] = useState(starterConversations);
  const [activeId, setActiveId] = useState(starterConversations[0].id);
  const active = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId]
  );

  // Input state
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);
  useAutoResize(textareaRef, { minRows: 1, maxRows: 6 });

  // Scroll to bottom on message change (debounced for smoothness)
  const bottomRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(
      () =>
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        }),
      50
    );
    return () => clearTimeout(t);
  }, [active?.messages.length]);

  // Theme persistence
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handlers
  const createChat = useCallback(() => {
    const chat = { id: crypto.randomUUID(), title: "New chat", messages: [] };
    setConversations((prev) => [chat, ...prev]);
    setActiveId(chat.id);
  }, []);

  const deleteChat = useCallback(
    (id) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (filtered.length === 0) {
          const newChat = {
            id: crypto.randomUUID(),
            title: "New chat",
            messages: [],
          };
          setActiveId(newChat.id);
          return [newChat];
        }
        if (id === activeId) {
          setActiveId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeId]
  );

  const send = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const thinkingMsg = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Thinking…",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...(c.messages || []), userMsg, thinkingMsg] }
          : c
      )
    );
    setInput("");

    // Fake response to mimic ChatGPT typing
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          const msgs = [...c.messages];
          const idx = msgs.findIndex((m) => m.id === thinkingMsg.id);
          if (idx !== -1)
            msgs[idx] = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `You said: "${trimmed}". Here's a concise response.\n\n- Point 1\n- Point 2\n\n_(This is a local mock — wire this up to your backend or OpenAI API.)_`,
            };
          const title =
            c.title === "New chat" ? formatTitle(trimmed) : c.title;
          return { ...c, messages: msgs, title };
        })
      );
    }, 650);
  }, [activeId, input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="h-dvh w-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex overflow-hidden">
      {/* Sidebar */}
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
            sidebarOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none",
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
            <button
              onClick={() =>
                setTheme((t) => (t === "dark" ? "light" : "dark"))
              }
              aria-label="Toggle theme"
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
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
                <button
                  onClick={() => setActiveId(c.id)}
                  className="flex-1 text-left truncate text-sm"
                >
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

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="h-14 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:dark:bg-zinc-900/40 sticky top-0 z-10">
          <div className="h-full px-3 md:px-6 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen((o) => !o)}
                aria-label="Toggle sidebar"
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeftOpen className="h-5 w-5" />
                )}
              </button>
              <span className="font-medium">ChatGPT UI</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6">
          <div className="max-w-3xl mx-auto py-4 md:py-6">
            {(active?.messages?.length ?? 0) === 0 && (
              <div className="text-center text-zinc-500 dark:text-zinc-400 py-10">
                Start a conversation
              </div>
            )}

            {active?.messages?.map((m) => (
              <div key={m.id} className="w-full">
                <div className="grid grid-cols-[auto,1fr] gap-3 md:gap-4 py-4">
                  <div
                    className={classNames(
                      "h-9 w-9 md:h-10 md:w-10 rounded-lg flex items-center justify-center",
                      m.role === "assistant"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    )}
                  >
                    {m.role === "assistant" ? (
                      <Bot className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 z-10 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-zinc-900/50">
          <div
            className="max-w-3xl mx-auto px-3 md:px-6 py-3"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message ChatGPT"
                className="flex-1 resize-none rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                aria-label="Send message"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 dark:border-zinc-700 px-3 h-10 shrink-0 disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
              Press <kbd className="px-1 py-0.5 rounded border">Enter</kbd> to
              send •{" "}
              <kbd className="px-1 py-0.5 rounded border">Shift</kbd> +{" "}
              <kbd className="px-1 py-0.5 rounded border">Enter</kbd> for
              newline
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
