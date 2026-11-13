import type { Conversation, User } from "../services/api";

interface Props {
  user: User;
  conversations: Conversation[];
  activeId: number | null;
  search: string;
  open: boolean;
  onSearch: (value: string) => void;
  onNewChat: () => void;
  onSelect: (id: number) => void;
  onRename: (conversation: Conversation) => void;
  onDelete: (conversation: Conversation) => void;
  onClose: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  user,
  conversations,
  activeId,
  search,
  open,
  onSearch,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
  onClose,
  onLogout,
  onOpenSettings,
}: Props) {
  return (
    <>
      {open && <div className="backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="logo">D</div>
          <span>DADDY IS DON</span>
        </div>

        <button className="new-chat" onClick={onNewChat}>
          + New chat
        </button>

        <input
          className="search"
          placeholder="Search chats..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />

        <div className="chat-list">
          {conversations.length === 0 && (
            <p className="muted">
              {search ? "No chats found." : "No chats yet. Start one!"}
            </p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`chat-item ${c.id === activeId ? "active" : ""}`}
              onClick={() => onSelect(c.id)}
            >
              <span className="chat-title">{c.title}</span>
              <span className="chat-actions">
                <button
                  title="Rename"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(c);
                  }}
                >
                  Edit
                </button>
                <button
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c);
                  }}
                >
                  &times;
                </button>
              </span>
            </div>
          ))}
        </div>

        <button className="settings-btn" onClick={onOpenSettings}>
          Settings
        </button>

        <div className="profile">
          <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
          <div className="profile-text">
            <span className="profile-name">{user.username}</span>
            <span className="profile-email">{user.email}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

