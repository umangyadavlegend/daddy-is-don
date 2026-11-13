import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../services/api";
import type { User } from "../services/api";

interface Props {
  onLoggedIn: (user: User) => void;
}

export default function AuthPage({ onLoggedIn }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (username.trim().length < 2) {
        setError("Your name needs at least 2 letters.");
        return;
      }
      if (password.length < 8) {
        setError("Your password needs at least 8 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      const result =
        mode === "login"
          ? await api.login(email.trim(), password)
          : await api.register(email.trim(), username.trim(), password);
      onLoggedIn(result.user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="logo big">D</div>
        <h1>DADDY IS DON</h1>
        <p className="tagline">Your AI. Your Conversation. Your World.</p>

        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>

        {mode === "register" && (
          <input
            className="auth-input"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="name"
          />
        )}

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <input
          className="auth-input"
          type="password"
          placeholder={mode === "register" ? "Password (8+ characters)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>

        <p className="muted">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button type="button" className="link-btn" onClick={switchMode}>
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
      </form>
    </div>
  );
}
