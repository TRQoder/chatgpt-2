import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Messages from "../components/Messages";
import Composer from "../components/Composer";
import { classNames, useAutoResize, formatTitle } from "../utils/ui";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const starterConversations = [
  {
    _id: crypto.randomUUID(),
    title: "New chat",
    messages: [
      {
        _id: crypto.randomUUID(),
        role: "assistant",
        content: "Hi! I’m your AI assistant. Ask me anything ✨",
      },
    ],
  },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const [conversations, setConversations] = useState(starterConversations);
  const [activeId, setActiveId] = useState(starterConversations[0]._id);
  const navigate = useNavigate();

  const active = useMemo(
    () => conversations.find((c) => c._id === activeId),
    [conversations, activeId]
  );

  // Input state
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);
  useAutoResize(textareaRef, { minRows: 1, maxRows: 6 });

  const bottomRef = useRef(null);

  // Theme persistence
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handlers
  const createChat = () => {
    const chatTitle = prompt("Enter title of the Chat") || "New chat";
    const chat = { _id: crypto.randomUUID(), title: chatTitle, messages: [] };
    setConversations((prev) => [chat, ...prev]);
    setActiveId(chat._id);
  };

  const deleteChat = useCallback(
    (id) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c._id !== id);
        if (filtered.length === 0) {
          const newChat = {
            _id: crypto.randomUUID(),
            title: "New chat",
            messages: [],
          };
          setActiveId(newChat._id); // ✅ fixed
          return [newChat];
        }
        if (id === activeId) {
          setActiveId(filtered[0]._id); // ✅ fixed
        }
        return filtered;
      });
    },
    [activeId]
  );

  const send = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { _id: crypto.randomUUID(), role: "user", content: trimmed };
    const thinkingMsg = {
      _id: crypto.randomUUID(),
      role: "assistant",
      content: "Thinking…",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c._id === activeId
          ? { ...c, messages: [...(c.messages || []), userMsg, thinkingMsg] }
          : c
      )
    );
    setInput("");

    // Fake response
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id !== activeId) return c;
          const msgs = [...c.messages];
          const idx = msgs.findIndex((m) => m._id === thinkingMsg._id);
          if (idx !== -1)
            msgs[idx] = {
              _id: crypto.randomUUID(),
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

  //logout function
  const onLogout = async () => {
    try {
      const res = await axios.get("/api/auth/logout");
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  // fetch user loggedin or not and chats
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);

        const chatRes = await axios.get("/api/chat/getChats");
        if (chatRes.data.chats.length) {
          setConversations(chatRes.data.chats);
          setActiveId(chatRes.data.chats[0]._id);
        }
      } catch (error) {
        setUser(null);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100">
        Loading...
      </div>
    );
  }
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
        onLogout={onLogout}
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
