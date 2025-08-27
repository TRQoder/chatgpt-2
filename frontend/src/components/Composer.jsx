import React from "react";
import { Send } from "lucide-react";

export default function Composer({ textareaRef, input, setInput, handleKeyDown, send }) {
  return (
    <div className="sticky bottom-0 z-10">
      <div className="max-w-3xl mx-auto px-3 md:px-6 py-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatGPT"
            className="flex-1 resize-none rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            aria-label="Send message"
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 dark:border-zinc-700 px-3 h-10 shrink-0 disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
          Press <kbd className="px-1 py-0.5 rounded border">Enter</kbd> to send • <kbd className="px-1 py-0.5 rounded border">Shift</kbd> + <kbd className="px-1 py-0.5 rounded border">Enter</kbd> for newline
        </div>
      </div>
    </div>
  );
}
