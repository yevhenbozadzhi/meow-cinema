"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, ChevronUp, MessageSquare, X } from "lucide-react";
import { AIChatMessage } from "../../types/types";
import Button from "../Button";
import { getAIChatMessages, sendAIChatMessage, typeText } from "@/lib/ai-chat";

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
    </span>
  );
}

export default function AIChat() {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const stopTypeTextRef = useRef<(() => void) | null>(null);

  const handleSendMessage = async () => {
    const text = messageInput.trim();
    if (!text || isSending) return;

    const assistantId = crypto.randomUUID();

    setIsSending(true);
    setMessageInput("");

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        userId: "",
        role: "USER",
        content: text,
        createdAt: new Date().toISOString(),
      },
      {
        id: assistantId,
        userId: "",
        role: "ASSISTANT",
        content: "",
        createdAt: new Date().toISOString(),
        isTyping: true,
      },
    ]);

    try {
      const sentMessage = await sendAIChatMessage(text);
      if (!sentMessage?.result) {
        throw new Error("Failed to send message");
      }

      const fullReply = sentMessage.result;

      stopTypeTextRef.current?.();
      stopTypeTextRef.current = typeText(
        fullReply,
        (partial) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: partial, isTyping: true }
                : message,
            ),
          );
        },
        15,
        () => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: fullReply, isTyping: false }
                : message,
            ),
          );
          setIsSending(false);
        },
      );
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: "Sorry, something went wrong. Try again.",
                isTyping: false,
              }
            : message,
        ),
      );
      setIsSending(false);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getAIChatMessages();
        if (!data) {
          throw new Error("Failed to fetch messages");
        }
        setMessages(
          data.map((item: AIChatMessage) => {
            return {
              id: item.id,
              userId: item.userId,
              content: item.content,
              role: item.role,
              createdAt: item.createdAt,
            };
          }),
        );
      } catch (error) {
        console.error(error);
      }
    };
    void fetchMessages();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close AI chat overlay"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-4 right-4 z-50 flex w-[min(100vw-2rem,22rem)] flex-col items-end gap-2">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-[#c38eb4]/25 bg-gray-900/95 px-3 py-2.5 text-left shadow-xl shadow-black/30 ring-1 ring-white/10 backdrop-blur-md transition-all duration-300 hover:border-[#c38eb4]/45 hover:shadow-[#c38eb4]/10"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c38eb4]/20 text-[#c38eb4] ring-1 ring-[#c38eb4]/30 transition-transform group-hover:scale-105">
                <Bot className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">AI assistant</p>
                <p className="truncate text-xs text-slate-400">
                  {messages.length > 0
                    ? `${messages.length} message${messages.length === 1 ? "" : "s"}`
                    : "Ask for film recommendations"}
                </p>
              </div>
            </div>
            <ChevronUp className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-[#c38eb4]" />
          </button>
        )}

        <div
          className={`flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-800/95 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-md transition-all duration-300 ${
            isOpen
              ? "pointer-events-auto max-h-[min(70vh,28rem)] opacity-100"
              : "pointer-events-none h-0 max-h-0 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c38eb4]/20 text-[#c38eb4]">
                <MessageSquare className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-base font-semibold text-white">AI Chat</h2>
              {messages.length > 0 && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                  {messages.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI chat"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={chatScrollRef}
            className="chat-scroll min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-950/30 px-4 py-3"
          >
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No messages yet. Ask me about films!
              </p>
            ) : (
              messages.map((message) => {
                const isMine = message.role === "USER";

                return (
                  <div
                    key={message.id}
                    className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        isMine
                          ? "rounded-br-sm bg-[#c38eb4]/90 text-white"
                          : "rounded-bl-sm bg-white/10 text-slate-200"
                      }`}
                    >
                      {!isMine && (
                        <p className="mb-0.5 text-xs font-medium text-[#c38eb4]/90">
                          AI
                        </p>
                      )}
                      <p className="break-words whitespace-pre-wrap">
                        {message.isTyping && !message.content ? (
                          <TypingDots />
                        ) : (
                          message.content
                        )}
                      </p>
                      {message.createdAt && (
                        <span
                          className={`mt-1 block text-[10px] ${isMine ? "text-white/70" : "text-slate-400"}`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-end gap-2 border-t border-white/10 bg-gray-900/50 p-3">
            <textarea
              placeholder="Ask about films…"
              value={messageInput}
              rows={2}
              className="max-h-24 min-h-[2.5rem] w-full resize-none rounded-md border border-white/10 bg-slate-800 p-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#c38eb4]"
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <Button
              type="button"
              disabled={!messageInput.trim() || isSending}
              className="shrink-0 px-4"
              onClick={() => void handleSendMessage()}
            >
              {isSending ? "…" : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
