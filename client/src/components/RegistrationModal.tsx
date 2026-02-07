import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { getUserCTAVariant } from "@/lib/ctaAbTest";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import {
  CheckCircle2, Sparkles, Zap, Crown, ArrowRight, Loader2,
  Bot, Shield, Clock, CreditCard
} from "lucide-react";

type Plan = "free" | "gold" | "diamond";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlan?: Plan;
  source?: string;
}

const planDetailsCs: Record<Plan, { name: string; price: string; color: string; icon: React.ReactNode; features: string[] }> = {
  free: { name: "FREE", price: "0 Kč", color: "text-gray-300", icon: <Bot className="w-5 h-5" />, features: ["3 iBoti", "100 konverzací/měsíc", "Základní analytics"] },
  gold: { name: "GOLD", price: "990 Kč/měsíc", color: "text-amber-400", icon: <Sparkles className="w-5 h-5 text-amber-400" />, features: ["Neomezení iBoti", "Neomezené konverzace", "66% affiliate provize", "API přístup"] },
  diamond: { name: "DIAMOND", price: "2 490 Kč/měsíc", color: "text-purple-400", icon: <Crown className="w-5 h-5 text-purple-400" />, features: ["Vše z GOLD", "White-label", "Custom persony", "77% affiliate provize"] },
};

const planDetailsEn: Record<Plan, { name: string; price: string; color: string; icon: React.ReactNode; features: string[] }> = {
  free: { name: "FREE", price: "$0", color: "text-gray-300", icon: <Bot className="w-5 h-5" />, features: ["3 iBots", "100 conversations/mo", "Basic analytics"] },
  gold: { name: "GOLD", price: "$39/month", color: "text-amber-400", icon: <Sparkles className="w-5 h-5 text-amber-400" />, features: ["Unlimited iBots", "Unlimited conversations", "66% affiliate commission", "API access"] },
  diamond: { name: "DIAMOND", price: "$99/month", color: "text-purple-400", icon: <Crown className="w-5 h-5 text-purple-400" />, features: ["Everything in GOLD", "White-label", "Custom personas", "77% affiliate commission"] },
};

export function RegistrationModal({ open, onOpenChange, initialPlan = "free", source = "hero_cta" }: RegistrationModalProps) {
  const { locale } = useI18n();
  const planDetails = locale === "en" ? planDetailsEn : planDetailsCs;

  const [step, setStep] = useState<"plan" | "form" | "success" | "redirecting">("plan");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(initialPlan);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [resultPlan, setResultPlan] = useState<string>("");

  const registerMutation = trpc.registration.register.useMutation();
  const checkoutMutation = trpc.stripe.createCheckout.useMutation();

  useEffect(() => {
    if (open) {
      setSelectedPlan(initialPlan);
      setStep(initialPlan !== "free" ? "form" : "plan");
      setEmail(""); setName(""); setCompany("");
      setGdprConsent(false); setError(""); setResultMessage("");
    }
  }, [open, initialPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const en = locale === "en";
    if (!email || !email.includes("@")) {
      setError(en ? "Please enter a valid email address." : "Zadejte platnou e-mailovou adresu.");
      return;
    }
    if (!gdprConsent) {
      setError(en ? "You must agree to the data processing to continue." : "Pro pokračování musíte souhlasit se zpracováním údajů.");
      return;
    }
    try {
      // Step 1: Create registration
      const result = await registerMutation.mutateAsync({
        email, name: name || undefined, company: company || undefined,
        plan: selectedPlan, source, ctaVariant: getUserCTAVariant(),
        affiliateCode: getAffiliateCodeFromUrl() || undefined, gdprConsent: true,
      });

      // Step 2: For paid plans, redirect to Stripe Checkout
      if (selectedPlan === "gold" || selectedPlan === "diamond") {
        setStep("redirecting");
        try {
          const checkout = await checkoutMutation.mutateAsync({
            plan: selectedPlan,
            email,
            registrationId: result.registrationId,
            name: name || undefined,
            origin: window.location.origin,
            affiliateCode: getAffiliateCodeFromUrl() || undefined,
          });
          toast.info(en ? "Redirecting to payment..." : "Přesměrování na platbu...");
          window.open(checkout.url, "_blank");
          setResultMessage(en
            ? "A payment window has been opened. Complete the payment there to activate your plan."
            : "Otevřelo se okno s platbou. Dokončete platbu tam pro aktivaci plánu.");
          setResultPlan(result.plan);
          setStep("success");
        } catch {
          setError(en ? "Failed to create payment session. Please try again." : "Nepodařilo se vytvořit platební relaci. Zkuste to znovu.");
          setStep("form");
        }
      } else {
        // FREE plan — instant activation
        setResultMessage(result.message);
        setResultPlan(result.plan);
        setStep("success");
      }
    } catch {
      setError(locale === "en" ? "Something went wrong. Please try again." : "Něco se pokazilo. Zkuste to prosím znovu.");
    }
  };

  const en = locale === "en";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0F0F18] border border-amber-500/20 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center font-[Space_Grotesk]">
            {step === "success" ? (
              <span className="text-green-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                {en ? "Registration complete!" : "Registrace dokončena!"}
              </span>
            ) : step === "redirecting" ? (
              <span className="text-amber-400 flex items-center justify-center gap-2">
                <CreditCard className="w-6 h-6" />
                {en ? "Redirecting to payment..." : "Přesměrování na platbu..."}
              </span>
            ) : step === "form" ? (
              <span className="text-gradient-gold">
                {en ? `Registration — ${planDetails[selectedPlan].name}` : `Registrace — ${planDetails[selectedPlan].name}`}
              </span>
            ) : (
              <span className="text-gradient-gold">
                {en ? "Choose your plan" : "Vyberte svůj plán"}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            {step === "success" ? resultMessage
              : step === "redirecting" ? (en ? "Please wait, we're preparing your payment..." : "Prosím čekejte, připravujeme vaši platbu...")
              : step === "form" ? (en ? `Fill in your details to activate the ${planDetails[selectedPlan].name} plan.` : `Vyplňte údaje pro aktivaci plánu ${planDetails[selectedPlan].name}.`)
              : (en ? "Start free or choose a plan that fits your needs." : "Začněte zdarma nebo vyberte plán, který odpovídá vašim potřebám.")}
          </DialogDescription>
        </DialogHeader>

        {step === "plan" && (
          <div className="space-y-3 mt-4">
            {(["free", "gold", "diamond"] as Plan[]).map((plan) => {
              const details = planDetails[plan];
              const isSelected = selectedPlan === plan;
              const isGold = plan === "gold";
              return (
                <button key={plan} onClick={() => setSelectedPlan(plan)}
                  className={`w-full text-left rounded-xl p-4 border transition-all ${
                    isSelected ? (isGold ? "border-amber-500/50 bg-amber-500/10" : plan === "diamond" ? "border-purple-500/50 bg-purple-500/10" : "border-white/20 bg-white/5")
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {details.icon}
                      <span className={`font-bold font-[Space_Grotesk] ${details.color}`}>{details.name}</span>
                      {isGold && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">{en ? "MOST POPULAR" : "NEJOBLÍBENĚJŠÍ"}</span>}
                    </div>
                    <span className="text-sm font-semibold text-white">{details.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {details.features.map((f) => <span key={f} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{f}</span>)}
                  </div>
                </button>
              );
            })}
            <Button onClick={() => setStep("form")} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6 mt-4">
              {en ? `Continue with ${planDetails[selectedPlan].name}` : `Pokračovat s ${planDetails[selectedPlan].name}`}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className={`flex items-center justify-between rounded-lg p-3 border ${
              selectedPlan === "gold" ? "bg-amber-500/5 border-amber-500/20" : selectedPlan === "diamond" ? "bg-purple-500/5 border-purple-500/20" : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center gap-2">
                {planDetails[selectedPlan].icon}
                <span className={`font-bold text-sm ${planDetails[selectedPlan].color}`}>{planDetails[selectedPlan].name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-white font-semibold">{planDetails[selectedPlan].price}</span>
                {(selectedPlan === "gold" || selectedPlan === "diamond") && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <CreditCard className="w-3 h-3" />
                    {en ? "Stripe secure payment" : "Bezpečná platba Stripe"}
                  </div>
                )}
              </div>
            </div>
            <Input type="email" placeholder={en ? "your@email.com *" : "vas@email.cz *"} value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50" />
            <Input type="text" placeholder={en ? "Full name" : "Jméno a příjmení"} value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50" />
            <Input type="text" placeholder={en ? "Company name (optional)" : "Název firmy (volitelné)"} value={company} onChange={(e) => setCompany(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50" />
            <div className="flex items-start gap-3">
              <Checkbox id="gdpr-reg" checked={gdprConsent} onCheckedChange={(checked) => setGdprConsent(checked === true)} className="mt-0.5 border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" />
              <label htmlFor="gdpr-reg" className="text-xs text-gray-400 leading-relaxed">
                {en ? "I agree to the processing of personal data for registration and receiving information about BOTHUB.cz products. I can withdraw my consent at any time."
                  : "Souhlasím se zpracováním osobních údajů za účelem registrace a zasílání informací o produktech BOTHUB.cz. Svůj souhlas mohu kdykoli odvolat."}
              </label>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("plan")} className="border-white/10 text-gray-400 hover:bg-white/5">
                {en ? "Back" : "Zpět"}
              </Button>
              <Button type="submit" disabled={registerMutation.isPending || checkoutMutation.isPending} className={`flex-1 font-bold py-6 ${
                selectedPlan === "diamond"
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black"
              }`}>
                {registerMutation.isPending || checkoutMutation.isPending ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {en ? "Processing..." : "Zpracovávám..."}</span>
                ) : selectedPlan === "free" ? (
                  en ? "Activate FREE" : "Aktivovat ZDARMA"
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {en ? `Pay & Activate ${planDetails[selectedPlan].name}` : `Zaplatit a aktivovat ${planDetails[selectedPlan].name}`}
                  </span>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {en ? "Secure" : "Bezpečné"}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5 min setup</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {en ? "No commitments" : "Žádné závazky"}</span>
            </div>
          </form>
        )}

        {step === "redirecting" && (
          <div className="text-center space-y-6 mt-4 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto" />
            <p className="text-gray-400">{en ? "Preparing secure payment..." : "Připravuji bezpečnou platbu..."}</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-6 mt-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              resultPlan === "gold" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : resultPlan === "diamond" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              : "bg-green-500/10 text-green-400 border border-green-500/20"
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              {resultPlan === "free"
                ? (en ? "FREE plan activated" : "FREE plán aktivován")
                : (en ? `${resultPlan?.toUpperCase()} — payment window opened` : `${resultPlan?.toUpperCase()} — platební okno otevřeno`)}
            </div>
            <div className="space-y-3 text-sm text-gray-400">
              {resultPlan === "free" ? (
                <>
                  <p>{en ? "Your FREE plan is active. You can start using 3 iBots right away." : "Váš FREE plán je aktivní. Můžete ihned začít používat 3 iBoty."}</p>
                  <p className="text-amber-400/80">{en ? "Want unlimited access? Upgrade to GOLD for $39/month." : "Chcete neomezený přístup? Upgradujte na GOLD za 990 Kč/měsíc."}</p>
                </>
              ) : (
                <>
                  <p>{en ? "A payment window has been opened in a new tab." : "Platební okno bylo otevřeno v nové záložce."}</p>
                  <p>{en ? "Complete the payment there to activate your plan." : "Dokončete platbu tam pro aktivaci vašeho plánu."}</p>
                  <p className="text-xs text-gray-500">{en ? "Test card: 4242 4242 4242 4242" : "Testovací karta: 4242 4242 4242 4242"}</p>
                </>
              )}
            </div>
            <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 py-6">
              {en ? "Got it" : "Rozumím"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getAffiliateCodeFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("ref") || params.get("affiliate") || null;
}
