import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { getUserCTAVariant } from "@/lib/ctaAbTest";
import {
  CheckCircle2, Sparkles, Zap, Crown, ArrowRight, Loader2,
  Bot, Shield, Clock
} from "lucide-react";

type Plan = "free" | "gold" | "diamond";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlan?: Plan;
  source?: string;
}

const planDetails: Record<Plan, { name: string; price: string; color: string; icon: React.ReactNode; features: string[] }> = {
  free: {
    name: "FREE",
    price: "0 Kč",
    color: "text-gray-300",
    icon: <Bot className="w-5 h-5" />,
    features: ["3 iBoti", "100 konverzací/měsíc", "Základní analytics"],
  },
  gold: {
    name: "GOLD",
    price: "990 Kč/měsíc",
    color: "text-amber-400",
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    features: ["Neomezení iBoti", "Neomezené konverzace", "66% affiliate provize", "API přístup"],
  },
  diamond: {
    name: "DIAMOND",
    price: "2 490 Kč/měsíc",
    color: "text-purple-400",
    icon: <Crown className="w-5 h-5 text-purple-400" />,
    features: ["Vše z GOLD", "White-label", "Custom persony", "77% affiliate provize"],
  },
};

export function RegistrationModal({ open, onOpenChange, initialPlan = "free", source = "hero_cta" }: RegistrationModalProps) {
  const [step, setStep] = useState<"plan" | "form" | "success">("plan");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(initialPlan);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [resultPlan, setResultPlan] = useState<string>("");

  const registerMutation = trpc.registration.register.useMutation();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedPlan(initialPlan);
      // If a specific plan is pre-selected (from pricing), skip plan step
      setStep(initialPlan !== "free" ? "form" : "plan");
      setEmail("");
      setName("");
      setCompany("");
      setGdprConsent(false);
      setError("");
      setResultMessage("");
    }
  }, [open, initialPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Zadejte platnou e-mailovou adresu.");
      return;
    }
    if (!gdprConsent) {
      setError("Pro pokračování musíte souhlasit se zpracováním údajů.");
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        email,
        name: name || undefined,
        company: company || undefined,
        plan: selectedPlan,
        source,
        ctaVariant: getUserCTAVariant(),
        affiliateCode: getAffiliateCodeFromUrl() || undefined,
        gdprConsent: true,
      });

      setResultMessage(result.message);
      setResultPlan(result.plan);
      setStep("success");
    } catch {
      setError("Něco se pokazilo. Zkuste to prosím znovu.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0F0F18] border border-amber-500/20 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center font-[Space_Grotesk]">
            {step === "success" ? (
              <span className="text-green-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Registrace dokončena!
              </span>
            ) : step === "form" ? (
              <span className="text-gradient-gold">
                Registrace — {planDetails[selectedPlan].name}
              </span>
            ) : (
              <span className="text-gradient-gold">
                Vyberte svůj plán
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            {step === "success"
              ? resultMessage
              : step === "form"
              ? `Vyplňte údaje pro aktivaci plánu ${planDetails[selectedPlan].name}.`
              : "Začněte zdarma nebo vyberte plán, který odpovídá vašim potřebám."}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: Plan Selection */}
        {step === "plan" && (
          <div className="space-y-3 mt-4">
            {(["free", "gold", "diamond"] as Plan[]).map((plan) => {
              const details = planDetails[plan];
              const isSelected = selectedPlan === plan;
              const isGold = plan === "gold";

              return (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full text-left rounded-xl p-4 border transition-all ${
                    isSelected
                      ? isGold
                        ? "border-amber-500/50 bg-amber-500/10"
                        : plan === "diamond"
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-white/20 bg-white/5"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {details.icon}
                      <span className={`font-bold font-[Space_Grotesk] ${details.color}`}>
                        {details.name}
                      </span>
                      {isGold && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                          NEJOBLÍBENĚJŠÍ
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white">{details.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {details.features.map((f) => (
                      <span key={f} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}

            <Button
              onClick={() => setStep("form")}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6 mt-4"
            >
              Pokračovat s {planDetails[selectedPlan].name}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 2: Registration Form */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Plan summary */}
            <div className={`flex items-center justify-between rounded-lg p-3 border ${
              selectedPlan === "gold"
                ? "bg-amber-500/5 border-amber-500/20"
                : selectedPlan === "diamond"
                ? "bg-purple-500/5 border-purple-500/20"
                : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center gap-2">
                {planDetails[selectedPlan].icon}
                <span className={`font-bold text-sm ${planDetails[selectedPlan].color}`}>
                  {planDetails[selectedPlan].name}
                </span>
              </div>
              <span className="text-sm text-white font-semibold">{planDetails[selectedPlan].price}</span>
            </div>

            <Input
              type="email"
              placeholder="vas@email.cz *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />

            <Input
              type="text"
              placeholder="Jméno a příjmení"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />

            <Input
              type="text"
              placeholder="Název firmy (volitelné)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />

            <div className="flex items-start gap-3">
              <Checkbox
                id="gdpr-reg"
                checked={gdprConsent}
                onCheckedChange={(checked) => setGdprConsent(checked === true)}
                className="mt-0.5 border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <label htmlFor="gdpr-reg" className="text-xs text-gray-400 leading-relaxed">
                Souhlasím se zpracováním osobních údajů za účelem registrace a zasílání informací o produktech BOTHUB.cz. Svůj souhlas mohu kdykoli odvolat.
              </label>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("plan")}
                className="border-white/10 text-gray-400 hover:bg-white/5"
              >
                Zpět
              </Button>
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6"
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registruji...
                  </span>
                ) : (
                  selectedPlan === "free" ? "Aktivovat ZDARMA" : `Registrovat ${planDetails[selectedPlan].name}`
                )}
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Bezpečné</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5 min setup</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Žádné závazky</span>
            </div>
          </form>
        )}

        {/* STEP 3: Success */}
        {step === "success" && (
          <div className="text-center space-y-6 mt-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              resultPlan === "gold"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : resultPlan === "diamond"
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : "bg-green-500/10 text-green-400 border border-green-500/20"
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              Plán {resultPlan?.toUpperCase()} {resultPlan === "free" ? "aktivován" : "registrován"}
            </div>

            <div className="space-y-3 text-sm text-gray-400">
              {resultPlan === "free" ? (
                <>
                  <p>Váš FREE plán je aktivní. Můžete ihned začít používat 3 iBoty.</p>
                  <p className="text-amber-400/80">
                    Chcete neomezený přístup? Upgradujte na GOLD za 990 Kč/měsíc.
                  </p>
                </>
              ) : (
                <>
                  <p>Děkujeme za registraci! Na váš e-mail jsme odeslali potvrzení.</p>
                  <p>Brzy vás budeme kontaktovat s instrukcemi pro aktivaci.</p>
                </>
              )}
            </div>

            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 py-6"
            >
              Rozumím
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Extract affiliate code from URL query params */
function getAffiliateCodeFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("ref") || params.get("affiliate") || null;
}
