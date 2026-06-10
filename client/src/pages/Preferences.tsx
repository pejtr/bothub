import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bot, ArrowLeft, Settings, Mail, CalendarClock } from "lucide-react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative w-12 h-6 rounded-full transition-colors ${on ? "bg-[#D4AF37]" : "bg-white/15"} ${disabled ? "opacity-50" : ""}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-6" : ""}`} />
    </button>
  );
}

export default function Preferences() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const prefs = trpc.preferences.get.useQuery(undefined, { enabled: isAuthenticated });
  const update = trpc.preferences.update.useMutation({
    onSuccess: () => { utils.preferences.get.invalidate(); toast.success("Nastavení uloženo"); },
    onError: () => toast.error("Nepodařilo se uložit"),
  });

  const weeklyDigest = (prefs.data?.weeklyDigest ?? 1) === 1;
  const marketingEmails = (prefs.data?.marketingEmails ?? 1) === 1;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <header className="border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#8B7355] rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold">BOTHUB</span>
            </div>
          </Link>
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Zpět
            </button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 flex items-center justify-center">
            <Settings className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Nastavení e-mailů</h1>
            <p className="text-gray-500 text-sm">Spravujte, jaké e-maily vám posíláme</p>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-16">Načítám...</p>
        ) : !isAuthenticated ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">Pro správu nastavení se přihlaste.</p>
            <button
              onClick={() => (window.location.href = getLoginUrl())}
              className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-medium hover:bg-[#E5C04B] transition-colors"
            >
              Přihlásit se
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-start gap-3">
                <CalendarClock className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                <div>
                  <p className="font-medium">Týdenní souhrn oblíbených</p>
                  <p className="text-sm text-gray-500">Každý týden přehled novinek u vašich oblíbených iBotů.</p>
                </div>
              </div>
              <Toggle on={weeklyDigest} disabled={update.isPending} onChange={(v) => update.mutate({ weeklyDigest: v ? 1 : 0 })} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                <div>
                  <p className="font-medium">Marketingové e-maily</p>
                  <p className="text-sm text-gray-500">Tipy, novinky a akční nabídky BOTHUB.</p>
                </div>
              </div>
              <Toggle on={marketingEmails} disabled={update.isPending} onChange={(v) => update.mutate({ marketingEmails: v ? 1 : 0 })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
