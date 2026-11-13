import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import { api, setUnauthorizedHandler, tokenStore } from "./services/api";
import type { User } from "./services/api";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(tokenStore.get() !== null);

  useEffect(() => {
    // If the login stops working, show the login page.
    setUnauthorizedHandler(() => setUser(null));

    // If we have a saved login, check that it is still good.
    if (tokenStore.get()) {
      api
        .me()
        .then(setUser)
        .catch(() => undefined)
        .finally(() => setChecking(false));
    }
    return () => setUnauthorizedHandler(null);
  }, []);

  async function handleLogout() {
    await api.logout();
    setUser(null);
  }

  if (checking) return <div className="loading-screen">Loading...</div>;
  if (!user) return <AuthPage onLoggedIn={setUser} />;
  return <ChatPage key={user.id} user={user} onLogout={handleLogout} />;
}
