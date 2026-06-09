/**
 * Chat Modal Component
 * Real chat interface for interacting with iBots via BotHub API (LLM)
 * Features: conversation logging, post-chat feedback, session tracking
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Lock,
  Star,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import type { IBot } from "@/data/ibots";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatModalProps {
  bot: IBot | null;
  isOpen: boolean;
  onClose: () => void;
}

// Generate a session ID for this conversation
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Get or create a visitor ID
function getVisitorId(): string {
  let id = localStorage.getItem("ibot_visitor_id");
  if (!id) {
    id = `vis_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("ibot_visitor_id", id);
  }
  return id;
}

export default function ChatModal({ bot, isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [sessionId] = useState(() => generateSessionId());
  const [sessionStart] = useState(() => Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_FREE_MESSAGES = 3;

  const chatMutation = trpc.chat.send.useMutation();
  const logSessionMutation = trpc.conversations.logSession.useMutation();
  const submitFeedbackMutation = trpc.conversations.submitFeedback.useMutation();

  useEffect(() => {
    if (isOpen && bot) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Ahoj! Jsem ${bot.name}, tvůj AI asistent specializující se na ${bot.specialty}. Jak ti mohu dnes pomoci?`,
          timestamp: new Date(),
        },
      ]);
      setMessageCount(0);
      setShowFeedback(false);
      setFeedbackRating(0);
      setFeedbackComment("");
      setFeedbackSubmitted(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, bot]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Log session when closing (if there were messages)
  const handleClose = useCallback(() => {
    if (messageCount > 0 && bot) {
      const durationSeconds = Math.round((Date.now() - sessionStart) / 1000);
      const firstUserMessage = messages.find(m => m.role === "user")?.content;
      
      logSessionMutation.mutate({
        sessionId,
        botId: bot.id,
        visitorId: getVisitorId(),
        messageCount,
        firstMessage: firstUserMessage?.slice(0, 200),
        durationSeconds,
      });

      // Show feedback if had meaningful conversation (2+ messages)
      if (messageCount >= 2 && !feedbackSubmitted) {
        setShowFeedback(true);
        return; // Don't close yet, show feedback first
      }
    }
    onClose();
  }, [messageCount, bot, messages, sessionId, sessionStart, feedbackSubmitted, logSessionMutation, onClose]);

  const handleFeedbackSubmit = async () => {
    if (!bot || feedbackRating === 0) return;
    
    await submitFeedbackMutation.mutateAsync({
      sessionId,
      botId: bot.id,
      rating: feedbackRating,
      comment: feedbackComment || undefined,
      visitorId: getVisitorId(),
    });
    
    setFeedbackSubmitted(true);
    setTimeout(() => onClose(), 1500);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !bot || isLoading) return;

    if (messageCount >= MAX_FREE_MESSAGES) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setMessageCount((prev) => prev + 1);

    try {
      const conversationHistory = [...messages, userMessage]
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }));

      const response = await chatMutation.mutateAsync({
        botId: bot.id,
        botName: bot.name,
        botSpecialty: bot.specialty,
        messages: conversationHistory,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Omlouvám se, momentálně nemohu odpovědět. Zkuste to prosím za chvíli znovu.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!bot) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:h-[600px] bg-[#0A0A0F] border border-[#2A2A2F] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Feedback Screen */}
            {showFeedback ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                {feedbackSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                      <ThumbsUp className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Děkujeme za zpětnou vazbu!</h3>
                    <p className="text-gray-400">Pomáháte nám zlepšovat iBoty pro vás.</p>
                  </motion.div>
                ) : (
                  <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center mx-auto">
                        <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Jak se vám líbil {bot.name}?</h3>
                      <p className="text-gray-400 text-sm">Vaše zpětná vazba nám pomáhá zlepšovat iBoty</p>
                    </div>

                    {/* Star Rating */}
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              star <= feedbackRating
                                ? "text-[#D4AF37] fill-[#D4AF37]"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Comment */}
                    {feedbackRating > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Textarea
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          placeholder="Volitelný komentář (co se vám líbilo, co zlepšit?)"
                          className="bg-[#1A1A1F] border-[#2A2A2F] text-white resize-none text-sm"
                          rows={3}
                        />
                      </motion.div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        className="flex-1 text-gray-400 hover:text-white"
                        onClick={() => onClose()}
                      >
                        Přeskočit
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] font-semibold"
                        onClick={handleFeedbackSubmit}
                        disabled={feedbackRating === 0 || submitFeedbackMutation.isPending}
                      >
                        {submitFeedbackMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Odeslat hodnocení"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#2A2A2F]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center text-xl">
                      {bot.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{bot.name}</h3>
                      <p className="text-xs text-gray-500">{bot.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-[#1A1A1F] px-2 py-1 rounded-full">
                      {messageCount < MAX_FREE_MESSAGES 
                        ? `Demo: ${messageCount}/${MAX_FREE_MESSAGES} zpráv`
                        : "Limit dosažen"
                      }
                    </span>
                    <button
                      onClick={handleClose}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          message.role === "user"
                            ? "bg-[#D4AF37]/20"
                            : "bg-gradient-to-br from-[#D4AF37] to-[#8B7355]"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-[#D4AF37]" />
                        ) : (
                          <Bot className="w-4 h-4 text-[#0A0A0F]" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] p-3 rounded-xl ${
                          message.role === "user"
                            ? "bg-[#D4AF37]/20 text-white"
                            : "bg-[#1A1A1F] text-gray-300"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString("cs-CZ", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-[#0A0A0F]" />
                      </div>
                      <div className="bg-[#1A1A1F] p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                          <span className="text-sm text-gray-400">
                            {bot.name} přemýšlí...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Upgrade prompt when limit reached */}
                {messageCount >= MAX_FREE_MESSAGES && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-[#D4AF37]/20 to-[#8B7355]/20 border-t border-[#D4AF37]/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                          Dosáhli jste limitu demo zpráv
                        </p>
                        <p className="text-xs text-gray-400">
                          Upgradujte na GOLD pro neomezený přístup ke všem iBotům
                        </p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] font-semibold hover:opacity-90"
                        onClick={() => {
                          onClose();
                          document.getElementById("cenik")?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Upgradovat
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-[#2A2A2F]">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={
                        messageCount >= MAX_FREE_MESSAGES
                          ? "Upgradujte pro pokračování..."
                          : `Zeptejte se ${bot.name}...`
                      }
                      disabled={isLoading || messageCount >= MAX_FREE_MESSAGES}
                      className="flex-1 bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isLoading || messageCount >= MAX_FREE_MESSAGES}
                      className="bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] hover:opacity-90 px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {messageCount < MAX_FREE_MESSAGES 
                      ? `Demo verze • ${MAX_FREE_MESSAGES - messageCount} zpráv zbývá • Upgradujte na GOLD pro neomezený přístup`
                      : "Upgradujte na GOLD nebo DIAMOND pro neomezený přístup ke všem iBotům"
                    }
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
