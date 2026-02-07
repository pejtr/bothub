import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Bot, Send, X, MessageCircle, Sparkles, Loader2, User } from "lucide-react";
import { Streamdown } from "streamdown";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function LiveChatDemo() {
  const { locale } = useI18n();
  const en = locale === "en";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.chat.send.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [...prev, { role: "assistant", content: response.content }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: en ? "Sorry, please try again." : "Omlouvám se, zkuste to prosím znovu." },
      ]);
    },
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, chatMutation.isPending]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;
    const newMsg: Message = { role: "user", content: trimmed };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInput("");
    chatMutation.mutate({ messages: updated });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const suggestedPrompts = en
    ? ["How do iBots increase sales?", "How much is the GOLD plan?", "How does the affiliate work?"]
    : ["Jak iBoti zvyšují prodeje?", "Kolik stojí GOLD plán?", "Jak funguje affiliate?"];

  const displayMessages = messages.filter((m) => m.role !== "system");

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 flex items-center justify-center hover:shadow-amber-500/40 transition-shadow cursor-pointer group"
          >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            <span className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] rounded-2xl border border-white/10 bg-[#0D0D14] shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Alex Hormozi iBot</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white mb-1">{en ? "Try the iBot live!" : "Vyzkoušejte iBota v akci!"}</p>
                    <p className="text-xs text-gray-500">{en ? "Ask anything about BOTHUB" : "Zeptejte se na cokoli o BOTHUB"}</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-[280px]">
                    {suggestedPrompts.map((prompt) => (
                      <button key={prompt} onClick={() => {
                        const newMsg: Message = { role: "user", content: prompt };
                        const updated = [newMsg];
                        setMessages(updated);
                        chatMutation.mutate({ messages: updated });
                      }} className="text-left text-xs px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02] text-gray-400 hover:text-amber-400 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all cursor-pointer">
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {displayMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-black" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.role === "user" ? "bg-amber-500/20 text-amber-100 border border-amber-500/20" : "bg-white/5 text-gray-200 border border-white/5"}`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_p]:leading-relaxed">
                            <Streamdown>{msg.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 shrink-0 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                          <User className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  {chatMutation.isPending && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-white/5 p-3 bg-[#0A0A0F]">
              <div className="flex gap-2">
                <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder={en ? "Type a message..." : "Napište zprávu..."}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all"
                  disabled={chatMutation.isPending}
                />
                <Button onClick={handleSend} disabled={!input.trim() || chatMutation.isPending} size="icon" className="shrink-0 w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-black disabled:opacity-30">
                  {chatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-gray-600 mt-2 text-center">
                {en ? "This is a demo of the Alex Hormozi iBot. Full version available after registration." : "Toto je ukázka Alex Hormozi iBota. Plná verze dostupná po registraci."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
