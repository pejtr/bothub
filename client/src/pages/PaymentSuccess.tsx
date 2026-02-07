import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, Sparkles, Crown, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [plan, setPlan] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPlan(params.get("plan") || "");
    setSessionId(params.get("session_id") || "");
  }, []);

  const isGold = plan === "gold";
  const isDiamond = plan === "diamond";

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Success animation */}
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
          isDiamond ? "bg-purple-500/20 border-2 border-purple-500/40" : "bg-amber-500/20 border-2 border-amber-500/40"
        }`}>
          <CheckCircle2 className={`w-10 h-10 ${isDiamond ? "text-purple-400" : "text-amber-400"}`} />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold font-[Space_Grotesk] text-white">
            Platba úspěšná!
          </h1>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
            isDiamond ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            {isDiamond ? <Crown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {plan?.toUpperCase()} plán aktivován
          </div>
        </div>

        <div className="space-y-4 text-gray-400 text-sm">
          <p>Děkujeme za vaši důvěru! Váš <strong className="text-white">{plan?.toUpperCase()}</strong> plán je nyní aktivní.</p>
          <p>Na váš e-mail jsme odeslali potvrzení platby a přístupové údaje.</p>
          {isDiamond && (
            <p className="text-purple-400/80">Jako DIAMOND člen máte přístup k white-label řešení a custom personám.</p>
          )}
          {isGold && (
            <p className="text-amber-400/80">Jako GOLD člen máte neomezený přístup ke všem iBotům a API.</p>
          )}
        </div>

        <div className="space-y-3 pt-4">
          <Link href="/">
            <Button className={`w-full font-bold py-6 ${
              isDiamond ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black"
            }`}>
              Přejít na hlavní stránku
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {sessionId && (
          <p className="text-xs text-gray-600">
            ID transakce: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}
