import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Sparkles, CheckCircle2, Users, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getUserCTAVariant } from "@/lib/ctaAbTest";
import { useI18n } from "@/lib/i18n";

interface UnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
}

export function UnlockModal({ open, onOpenChange, onUnlock }: UnlockModalProps) {
  const { locale } = useI18n();
  const [email, setEmail] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const captureEmail = trpc.tracking.captureEmail.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError(locale === "en" ? "Please enter a valid email address." : "Zadejte platnou e-mailovou adresu.");
      return;
    }
    if (!gdprConsent) {
      setError(locale === "en" ? "You must agree to the data processing to continue." : "Pro pokračování musíte souhlasit se zpracováním osobních údajů.");
      return;
    }
    setIsSubmitting(true);
    try {
      await captureEmail.mutateAsync({
        email,
        source: "unlock_modal",
        variant: getUserCTAVariant(),
        gdprConsent: true,
      });
      setSuccess(true);
      localStorage.setItem("ibots_unlocked", "true");
      setTimeout(() => {
        onUnlock();
        onOpenChange(false);
        setSuccess(false);
        setEmail("");
        setGdprConsent(false);
      }, 1500);
    } catch {
      setError(locale === "en" ? "Something went wrong. Please try again." : "Něco se pokazilo. Zkuste to prosím znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0F0F18] border border-amber-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center font-[Space_Grotesk]">
            {success ? (
              <span className="text-green-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                {locale === "en" ? "Unlocked!" : "Odemčeno!"}
              </span>
            ) : (
              <span className="text-gradient-gold">
                {locale === "en" ? "Unlock all 88 iBots" : "Odemkněte všech 88 iBotů"}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            {success
              ? (locale === "en" ? "You now have access to the complete catalog of AI personalities." : "Nyní máte přístup ke kompletnímu katalogu AI osobností.")
              : (locale === "en" ? "Enter your email to access the complete catalog of AI personalities." : "Zadejte svůj e-mail a získejte přístup ke kompletnímu katalogu AI osobností.")}
          </DialogDescription>
        </DialogHeader>

        {!success && (
          <>
            <div className="space-y-3 my-4">
              <div className="flex items-center gap-3 text-sm">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{locale === "en" ? "Access to all 88 AI personalities in 7 categories" : "Přístup ke všem 88 AI osobnostem ve 7 kategoriích"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{locale === "en" ? "Instant activation — deploy in 5 minutes" : "Okamžitá aktivace — nasazení do 5 minut"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{locale === "en" ? "Join 500+ companies already using iBots" : "Připojte se k 500+ firmám, které už používají iBoty"}</span>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-center text-sm text-amber-200/80">
              <span className="font-semibold text-amber-400">127</span>{" "}
              {locale === "en" ? "people unlocked the catalog in the last 24 hours" : "lidí si odemklo katalog za posledních 24 hodin"}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <Input
                type="email"
                placeholder={locale === "en" ? "your@email.com" : "vas@email.cz"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50 focus:ring-amber-500/20"
              />
              <div className="flex items-start gap-3">
                <Checkbox
                  id="gdpr"
                  checked={gdprConsent}
                  onCheckedChange={(checked) => setGdprConsent(checked === true)}
                  className="mt-0.5 border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <label htmlFor="gdpr" className="text-xs text-gray-400 leading-relaxed">
                  {locale === "en"
                    ? "I agree to the processing of personal data for the purpose of receiving information about BOTHUB.cz products and services. I can withdraw my consent at any time."
                    : "Souhlasím se zpracováním osobních údajů za účelem zasílání informací o produktech a službách BOTHUB.cz. Svůj souhlas mohu kdykoli odvolat."}
                </label>
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-base py-6 pulse-gold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> {locale === "en" ? "Unlocking..." : "Odemykám..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {locale === "en" ? "Unlock catalog FREE" : "Odemknout katalog ZDARMA"}
                  </span>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                {locale === "en" ? "No spam. No credit card. Instant access." : "Žádný spam. Žádná kreditní karta. Okamžitý přístup."}
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
