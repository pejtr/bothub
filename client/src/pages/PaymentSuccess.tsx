/**
 * Payment Success Page
 * Shown after successful Stripe checkout
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Crown, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export default function PaymentSuccess() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Get session_id from URL
  const sessionId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("session_id");
  }, []);

  const { data: session, isLoading } = trpc.stripe.getSession.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  const planName = session?.planId === "diamond" ? "DIAMOND" : session?.planId === "gold" ? "GOLD" : "Heritage Add-on";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-[#1A1A1F] border-[#D4AF37]/30 p-8 text-center">
        {isLoading ? (
          <div className="py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#D4AF37] animate-pulse" />
            </div>
            <p className="text-gray-400">Ověřujeme vaši platbu...</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#0A0A0F]" />
            </div>

            <h1 className="text-3xl font-bold mb-2">
              Platba <span className="text-[#D4AF37]">úspěšná!</span>
            </h1>

            <p className="text-gray-400 mb-6">
              Gratulujeme! Váš {planName} plán je nyní aktivní.
            </p>

            <div className="bg-[#0A0A0F] rounded-xl p-4 mb-6 border border-[#2A2A2F]">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <span className="font-semibold text-[#D4AF37]">{planName}</span>
              </div>
              {session?.customerEmail && (
                <p className="text-sm text-gray-500">
                  Potvrzení odesláno na: {session.customerEmail}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] font-semibold hover:opacity-90"
                onClick={() => navigate("/")}
              >
                Začít používat iBoty
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#2A2A2F] text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]"
                onClick={() => navigate("/")}
              >
                Zpět na hlavní stránku
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
