import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

interface Props {
  disabled: boolean;
  onSend: (text: string) => Promise<boolean>;
}

export default function MessageInput({ disabled, onSend }: Props) {
  const [text, setText] = useState("");
  const boxRef = useRef<HTMLTextAreaElement>(null);

  // Make the box grow when you type more lines.
  useEffect(() => {
    const el = boxRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [text]);

  async function submit() {
    const value = text.trim();
    if (!value || disabled) return;
    setText("");
    const ok = await onSend(value);
    if (!ok) setText(value); // give the text back if sending failed
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends. Shift + Enter makes a new line.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="input-area">
      <div className="input-box">
        <textarea
          ref={boxRef}
          rows={1}
          placeholder="Message DADDY IS DON..."
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="send" onClick={submit} disabled={disabled || !text.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
