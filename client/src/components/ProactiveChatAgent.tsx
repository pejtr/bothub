/**
 * Proactive Chat Agent
 * Monitors user behavior and triggers contextual chat suggestions
 * 
 * Triggers:
 * - scroll_pricing: User scrolls to pricing section
 * - time_on_page_60s: User spends 60+ seconds on page
 * - exit_intent: Mouse moves toward browser top (desktop only)
 * - scroll_catalog: User scrolls to catalog section
 * - revisit: User has visited before (localStorage check)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProactiveChatAgentProps {
  onOpenChat: (botId: string, message: string) => void;
  comparedBotCount?: number; // number of bots user has clicked/viewed in catalog
}

function getVisitorId(): string {
  const key = "ibots_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function ProactiveChatAgent({ onOpenChat, comparedBotCount }: ProactiveChatAgentProps) {
  const [notification, setNotification] = useState<{
    botId: string;
    message: string;
    eventType: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const triggeredEvents = useRef<Set<string>>(new Set());
  const visitorId = useRef(getVisitorId());

  const logEvent = trpc.proactiveChat.logEvent.useMutation();
  const markInteracted = trpc.proactiveChat.markInteracted.useMutation();

  // Check if this event was already dismissed in this session
  const sessionDismissed = useRef<Set<string>>(new Set());

  const triggerEvent = useCallback(async (eventType: string, eventData?: string) => {
    // Don't trigger if already triggered or dismissed
    if (triggeredEvents.current.has(eventType)) return;
    if (sessionDismissed.current.has(eventType)) return;
    if (notification) return; // Don't stack notifications

    triggeredEvents.current.add(eventType);

    try {
      const result = await logEvent.mutateAsync({
        visitorId: visitorId.current,
        eventType,
        eventData,
        pageUrl: window.location.href,
      });

      if (result.shouldTrigger && result.botId && result.message) {
        setNotification({
          botId: result.botId,
          message: result.message,
          eventType,
        });
      }
    } catch (err) {
      // Silently fail - proactive chat is non-critical
      console.debug("[ProactiveChat] Event logging failed:", err);
    }
  }, [notification, logEvent]);

  // Track revisit
  useEffect(() => {
    const visitKey = "ibots_visited";
    const hasVisited = localStorage.getItem(visitKey);
    
    if (hasVisited) {
      // Delay revisit trigger to not be too aggressive
      const timer = setTimeout(() => {
        triggerEvent("revisit");
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      localStorage.setItem(visitKey, "true");
    }
  }, [triggerEvent]);

  // Track time on page (60s)
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerEvent("time_on_page_60s");
    }, 60000);
    return () => clearTimeout(timer);
  }, [triggerEvent]);

  // Track scroll to pricing section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerEvent("scroll_pricing");
          }
        });
      },
      { threshold: 0.3 }
    );

    const pricingSection = document.getElementById("cenik");
    if (pricingSection) observer.observe(pricingSection);

    return () => observer.disconnect();
  }, [triggerEvent]);

  // Track scroll to catalog section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerEvent("scroll_catalog");
          }
        });
      },
      { threshold: 0.3 }
    );

    const catalogSection = document.getElementById("katalog");
    if (catalogSection) observer.observe(catalogSection);

    return () => observer.disconnect();
  }, [triggerEvent]);

  // Track catalog comparison (3+ bots viewed)
  useEffect(() => {
    if (comparedBotCount && comparedBotCount >= 3) {
      triggerEvent("catalog_comparison", `viewed_${comparedBotCount}_bots`);
    }
  }, [comparedBotCount, triggerEvent]);

  // Track exit intent (mouse leaves viewport from top - desktop only)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        triggerEvent("exit_intent");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [triggerEvent]);

  const handleDismiss = () => {
    if (notification) {
      sessionDismissed.current.add(notification.eventType);
    }
    setNotification(null);
    setDismissed(true);
  };

  const handleAccept = () => {
    if (notification) {
      markInteracted.mutate({
        visitorId: visitorId.current,
        eventType: notification.eventType,
      });
      onOpenChat(notification.botId, notification.message);
      setNotification(null);
    }
  };

  return (
    <AnimatePresence>
      {notification && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 max-w-sm"
        >
          <Card className="bg-[#1A1A1F]/95 backdrop-blur-lg border-[#D4AF37]/30 p-4 shadow-xl shadow-[#D4AF37]/10">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#2A2A2F] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Bot avatar + message */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#0A0A0F]" />
              </div>
              <div>
                <p className="text-sm text-white leading-relaxed">{notification.message}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="btn-gold flex-1 gap-2"
                onClick={handleAccept}
              >
                <MessageSquare className="w-4 h-4" />
                Chatovat
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={handleDismiss}
              >
                Později
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
