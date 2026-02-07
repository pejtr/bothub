import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, TrendingUp, Copy, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface AffiliateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AffiliateModal({ open, onOpenChange }: AffiliateModalProps) {
  const { locale } = useI18n();
  const en = locale === "en";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState("");
  const [copied, setCopied] = useState(false);

  const registerAffiliate = trpc.affiliate.register.useMutation();

  useEffect(() => {
    if (open) {
      setEmail(""); setName(""); setCompany(""); setWebsite("");
      setGdprConsent(false); setError(""); setSuccess(false);
      setAffiliateCode(""); setCopied(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError(en ? "Please enter a valid email address." : "Zadejte platnou e-mailovou adresu.");
      return;
    }
    if (!name.trim()) {
      setError(en ? "Please enter your name." : "Zadejte své jméno.");
      return;
    }
    if (!gdprConsent) {
      setError(en ? "You must agree to the data processing to continue." : "Pro pokračování musíte souhlasit se zpracováním údajů.");
      return;
    }
    try {
      const result = await registerAffiliate.mutateAsync({
        email, name, company: company || undefined, website: website || undefined, gdprConsent: true,
      });
      setAffiliateCode(result.affiliateCode);
      setSuccess(true);
    } catch {
      setError(en ? "Something went wrong. Please try again." : "Něco se pokazilo. Zkuste to prosím znovu.");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliateCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0F0F18] border border-amber-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center font-[Space_Grotesk]">
            {success ? (
              <span className="text-green-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                {en ? "Welcome to the program!" : "Vítejte v programu!"}
              </span>
            ) : (
              <span className="text-gradient-gold">
                {en ? "Become an affiliate partner" : "Staňte se affiliate partnerem"}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            {success
              ? (en ? "Your affiliate account has been created." : "Váš affiliate účet byl vytvořen.")
              : (en ? "Earn up to 77% recurring commission from every referred customer." : "Vydělávejte až 77% opakovanou provizi z každého přivedeného zákazníka.")}
          </DialogDescription>
        </DialogHeader>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-amber-400 font-[Space_Grotesk]">66–77%</div>
                <div className="text-xs text-gray-500">{en ? "recurring commission" : "opakovaná provize"}</div>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-amber-400 font-[Space_Grotesk]">{en ? "$6,200/yr" : "156 816 Kč"}</div>
                <div className="text-xs text-gray-500">{en ? "yearly potential" : "roční potenciál"}</div>
              </div>
            </div>
            <Input type="text" placeholder={en ? "Full name *" : "Jméno a příjmení *"} value={name} onChange={(e) => setName(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50" />
            <Input type="email" placeholder={en ? "Email *" : "E-mail *"} value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50" />
            <Input type="text" placeholder={en ? "Company name (optional)" : "Název firmy (volitelné)"} value={company} onChange={(e) => setCompany(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50" />
            <Input type="url" placeholder={en ? "Website / Blog URL (optional)" : "Web / Blog URL (volitelné)"} value={website} onChange={(e) => setWebsite(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50" />
            <div className="flex items-start gap-3">
              <Checkbox id="gdpr-aff" checked={gdprConsent} onCheckedChange={(checked) => setGdprConsent(checked === true)} className="mt-0.5 border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" />
              <label htmlFor="gdpr-aff" className="text-xs text-gray-400 leading-relaxed">
                {en ? "I agree to the processing of personal data and the terms of the BOTHUB.cz affiliate program." : "Souhlasím se zpracováním osobních údajů a s podmínkami affiliate programu BOTHUB.cz."}
              </label>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button type="submit" disabled={registerAffiliate.isPending} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6">
              {registerAffiliate.isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {en ? "Registering..." : "Registruji..."}</span>
              ) : (
                <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> {en ? "Register as partner" : "Registrovat se jako partner"}</span>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 text-center">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">{en ? "Your affiliate code" : "Váš affiliate kód"}</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-[Space_Grotesk] text-3xl font-black text-amber-400">{affiliateCode}</span>
                <button onClick={handleCopyCode} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title={en ? "Copy code" : "Kopírovat kód"}>
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">{en ? "Your referral link:" : "Váš referral odkaz:"}</p>
              <code className="text-xs text-amber-400/80 break-all">
                {typeof window !== "undefined" ? `${window.location.origin}?ref=${affiliateCode}` : `https://bothub.cz?ref=${affiliateCode}`}
              </code>
            </div>
            <div className="text-sm text-gray-400 space-y-2">
              <p>{en ? "We've sent a confirmation with further instructions to your email." : "Na váš e-mail jsme odeslali potvrzení s dalšími instrukcemi."}</p>
              <p className="text-amber-400/80">{en ? "Share your link and start earning!" : "Sdílejte svůj odkaz a začněte vydělávat!"}</p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6">
              {en ? "Got it, let's share" : "Rozumím, začínám sdílet"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
