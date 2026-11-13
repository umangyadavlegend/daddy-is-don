const BASE: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatResponse {
  conversation: Conversation;
  user_message: Message;
  assistant_message: Message;
}

// The login token is kept in the browser.
const TOKEN_KEY = "daddy_is_don_token";
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// App.tsx tells us what to do when the login is no longer valid.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  useToken = true
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = tokenStore.get();
  if (useToken && token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (!response.ok) {
    if (response.status === 401 && useToken) {
      tokenStore.clear();
      unauthorizedHandler?.();
    }
    let detail = "Something went wrong. Please try again.";
    try {
      const data = await response.json();
      if (typeof data.detail === "string") detail = data.detail;
      else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        detail = String(data.detail[0].msg);
      }
    } catch {
      // keep the default message
    }
    throw new Error(detail);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  register: async (email: string, username: string, password: string) => {
    const result = await request<AuthResponse>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify({ email, username, password }) },
      false
    );
    tokenStore.set(result.access_token);
    return result;
  },

  login: async (email: string, password: string) => {
    const result = await request<AuthResponse>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false
    );
    tokenStore.set(result.access_token);
    return result;
  },

  me: () => request<User>("/api/auth/me"),

  logout: async () => {
    try {
      await request<unknown>("/api/auth/logout", { method: "POST" }, false);
    } catch {
      // we log out on this device anyway
    }
    tokenStore.clear();
  },

  clearAllConversations: () =>
    request<void>("/api/conversations", { method: "DELETE" }),

  listConversations: (q = "") =>
    request<Conversation[]>(`/api/conversations?q=${encodeURIComponent(q)}`),

  getMessages: (id: number) =>
    request<Message[]>(`/api/conversations/${id}/messages`),

  renameConversation: (id: number, title: string) =>
    request<Conversation>(`/api/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),

  deleteConversation: (id: number) =>
    request<void>(`/api/conversations/${id}`, { method: "DELETE" }),

  sendMessage: (message: string, conversationId: number | null) =>
    request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, conversation_id: conversationId }),
    }),

  regenerateReply: (id: number) =>
    request<Message>(`/api/conversations/${id}/regenerate`, { method: "POST" }),

  clearConversation: (id: number) =>
    request<void>(`/api/conversations/${id}/messages`, { method: "DELETE" }),
};

