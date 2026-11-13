import { useState, isValidElement } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Get the plain text out of React content.
function getText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  if (isValidElement(node)) {
    return getText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.alert("Could not copy. Please select the text and press Ctrl + C.");
    }
  }

  return (
    <button className="copy-btn" onClick={copy}>
      {copied ? "Copied!" : label}
    </button>
  );
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const text = getText(children).replace(/\n$/, "");
  let language = "code";
  if (isValidElement(children)) {
    const cls = (children.props as { className?: string }).className || "";
    const match = /language-(\w+)/.exec(cls);
    if (match) language = match[1];
  }

  return (
    <div className="code-block">
      <div className="code-header">
        <span>{language}</span>
        <CopyButton text={text} label="Copy code" />
      </div>
      <pre>{children}</pre>
    </div>
  );
}

export default function MarkdownView({ text }: { text: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: CodeBlock,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
