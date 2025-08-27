import React from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import { classNames } from "../utils/ui";

export default function Messages({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto px-3 md:px-6">
      <div className="max-w-3xl mx-auto py-4 md:py-6">
        {(messages?.length ?? 0) === 0 && (
          <div className="text-center text-zinc-500 dark:text-zinc-400 py-10">Start a conversation</div>
        )}

        {messages?.map((m) => (
          <div key={m._id} className="w-full">
            <div className="grid grid-cols-[auto,1fr] gap-3 md:gap-4 py-4">
              <div
                className={classNames(
                  "h-9 w-9 md:h-10 md:w-10 rounded-lg flex items-center justify-center",
                  m.role === "assistant"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                )}
              >
                {m.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
