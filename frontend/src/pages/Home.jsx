import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Messages from "../components/Messages";
import Composer from "../components/Composer";
import { classNames, useAutoResize, formatTitle } from "../utils/ui";

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
  const createChat = () => {
    const chatTitle = prompt("Enter title of the Chat");
    const chat = { id: crypto.randomUUID(), title: chatTitle, messages: [] };
    setConversations((prev) => [chat, ...prev]);
    setActiveId(chat.id);
  }

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
    }, 2000);
  }, [activeId, input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="h-dvh w-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        setActiveId={setActiveId}
        createChat={createChat}
        deleteChat={deleteChat}
        theme={theme}
        setTheme={setTheme}
        sidebarOpen={sidebarOpen}
      />

      <main className="flex-1 flex flex-col">
        <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <Messages messages={active?.messages ?? []} />

        <div ref={bottomRef} />

        <Composer
          textareaRef={textareaRef}
          input={input}
          setInput={setInput}
          handleKeyDown={handleKeyDown}
          send={send}
        />
      </main>
    </div>
  );
}
