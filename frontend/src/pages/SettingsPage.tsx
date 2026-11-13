import { useState } from "react";
import { api } from "../services/api";
import type { User } from "../services/api";
import { applyTheme, getTheme } from "../theme";
import type { Theme } from "../theme";

interface Props {
  user: User;
  onClose: () => void;
  onLogout: () => void;
  onHistoryCleared: () => Promise<void>;
}

export default function SettingsPage({ user, onClose, onLogout, onHistoryCleared }: Props) {
  const [theme, setTheme] = useState<Theme>(getTheme());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function chooseTheme(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  async function clearHistory() {
    if (!window.confirm("Delete ALL your chats? This cannot be undone.")) return;
    setBusy(true);
    setMessage("");
    try {
      await api.clearAllConversations();
      await onHistoryCleared();
      setMessage("All chats deleted.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose} title="Close">
            &times;
          </button>
        </div>

        <section>
          <h3>Profile</h3>
          <div className="profile-row">
            <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="profile-text">
              <span className="profile-name">{user.username}</span>
              <span className="profile-email">{user.email}</span>
            </div>
          </div>
        </section>

        <section>
          <h3>Theme</h3>
          <div className="theme-options">
            <button
              className={theme === "dark" ? "selected" : ""}
              onClick={() => chooseTheme("dark")}
            >
              Dark
            </button>
            <button
              className={theme === "light" ? "selected" : ""}
              onClick={() => chooseTheme("light")}
            >
              Light
            </button>
          </div>
        </section>

        <section>
          <h3>Chat history</h3>
          <button className="danger-btn" onClick={clearHistory} disabled={busy}>
            {busy ? "Deleting..." : "Clear all chat history"}
          </button>
          {message && <p className="muted">{message}</p>}
        </section>

        <section>
          <button className="logout-btn wide" onClick={onLogout}>
            Logout
          </button>
        </section>
      </div>
    </div>
  );
}
