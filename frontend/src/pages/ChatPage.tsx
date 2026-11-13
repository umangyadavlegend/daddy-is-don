import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import SettingsPage from "./SettingsPage";
import { api } from "../services/api";
import type { Conversation, Message, User } from "../services/api";

interface Props {
  user: User;
  onLogout: () => void;
}

export default function ChatPage({ user, onLogout }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadConversations = useCallback(async (q: string) => {
    try {
      setConversations(await api.listConversations(q));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  // Load the chat list at start, and again when you search.
  useEffect(() => {
    const timer = setTimeout(() => loadConversations(search), 300);
    return () => clearTimeout(timer);
  }, [search, loadConversations]);

  function newChat() {
    if (sending) return;
    setActiveId(null);
    setMessages([]);
    setError("");
    setSidebarOpen(false);
  }

  async function selectConversation(id: number) {
    if (sending) return;
    setError("");
    setActiveId(id);
    setSidebarOpen(false);
    try {
      setMessages(await api.getMessages(id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleRename(c: Conversation) {
    const title = window.prompt("New name for this chat:", c.title);
    if (!title || !title.trim()) return;
    try {
      await api.renameConversation(c.id, title.trim().slice(0, 200));
      await loadConversations(search);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(c: Conversation) {
    if (sending) return;
    if (!window.confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteConversation(c.id);
      if (c.id === activeId) newChat();
      await loadConversations(search);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleSend(text: string): Promise<boolean> {
    setError("");
    // Show your message right away.
    const temp: Message = {
      id: -Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
    setSending(true);

    try {
      const result = await api.sendMessage(text, activeId);
      setActiveId(result.conversation.id);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== temp.id),
        result.user_message,
        result.assistant_message,
      ]);
      await loadConversations(search);
      return true;
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      setError((e as Error).message);
      return false;
    } finally {
      setSending(false);
    }
  }

  async function handleRegenerate() {
    if (sending || activeId === null) return;
    const previous = messages;
    if (previous.length < 2 || previous[previous.length - 1].role !== "assistant") return;

    setError("");
    setMessages(previous.slice(0, -1)); // hide the old answer
    setSending(true);
    try {
      const fresh = await api.regenerateReply(activeId);
      setMessages([...previous.slice(0, -1), fresh]);
    } catch (e) {
      setMessages(previous); // put the old answer back
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function handleClear() {
    if (sending || activeId === null) return;
    if (!window.confirm("Clear all messages in this chat?")) return;
    try {
      await api.clearConversation(activeId);
      setMessages([]);
      await loadConversations(search);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleHistoryCleared() {
    setActiveId(null);
    setMessages([]);
    setError("");
    setSearch("");
    await loadConversations("");
  }

  const activeTitle = conversations.find((c) => c.id === activeId)?.title ?? "New chat";

  return (
    <div className="app">
      <Sidebar
        user={user}
        conversations={conversations}
        activeId={activeId}
        search={search}
        open={sidebarOpen}
        onSearch={setSearch}
        onNewChat={newChat}
        onSelect={selectConversation}
        onRename={handleRename}
        onDelete={handleDelete}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
        onOpenSettings={() => {
          setSettingsOpen(true);
          setSidebarOpen(false);
        }}
      />

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              &#9776;
            </button>
            <span className="topbar-title">{activeTitle}</span>
          </div>
          {activeId !== null && messages.length > 0 && (
            <button className="clear-btn" onClick={handleClear} disabled={sending}>
              Clear chat
            </button>
          )}
        </header>

        <ChatWindow messages={messages} sending={sending} onRegenerate={handleRegenerate} />

        {error && <div className="error-banner">{error}</div>}

        <MessageInput disabled={sending} onSend={handleSend} />

        {settingsOpen && (
          <SettingsPage
            user={user}
            onClose={() => setSettingsOpen(false)}
            onLogout={onLogout}
            onHistoryCleared={handleHistoryCleared}
          />
        )}
      </main>
    </div>
  );
}

