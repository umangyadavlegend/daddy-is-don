import { useEffect, useRef } from "react";
import type { Message } from "../services/api";
import MarkdownView, { CopyButton } from "./MarkdownView";

interface Props {
  messages: Message[];
  sending: boolean;
  onRegenerate: () => void;
}

export default function ChatWindow({ messages, sending, onRegenerate }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  // Scroll down to the newest message.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  if (messages.length === 0 && !sending) {
    return (
      <div className="welcome">
        <h1>DADDY IS DON</h1>
        <p className="tagline">Your AI. Your Conversation. Your World.</p>
        <p className="muted">Type a message below to start chatting.</p>
      </div>
    );
  }

  const lastIndex = messages.length - 1;

  return (
    <div className="messages">
      <div className="messages-inner">
        {messages.map((m, i) => (
          <div key={m.id} className={`message ${m.role}`}>
            {m.role === "assistant" ? (
              <div className="assistant-wrap">
                <div className="bubble">
                  <MarkdownView text={m.content} />
                </div>
                <div className="msg-actions">
                  <CopyButton text={m.content} label="Copy" />
                  {i === lastIndex && !sending && (
                    <button className="copy-btn" onClick={onRegenerate}>
                      Regenerate
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bubble">{m.content}</div>
            )}
          </div>
        ))}

        {sending && (
          <div className="message assistant">
            <div className="bubble typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
