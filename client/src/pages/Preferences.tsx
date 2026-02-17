import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { getLoginUrl } from "../const";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Bell, Mail, Check, X } from "lucide-react";

export default function Preferences() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const { data: preferences, isLoading } = trpc.preferences.get.useQuery(undefined, {
    enabled: !!user,
  });

  const updateMutation = trpc.preferences.update.useMutation({
    onSuccess: () => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
  });

  useEffect(() => {
    if (preferences) {
      setWeeklyDigest(preferences.weeklyDigest === 1);
      setMarketingEmails(preferences.marketingEmails === 1);
    }
  }, [preferences]);

  // Check for unsubscribe query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unsubscribe = params.get("unsubscribe");
    if (unsubscribe === "wishlist" && preferences) {
      setWeeklyDigest(false);
      // Unsubscribe handled by useEffect
    }
  }, [preferences]);

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  const handleSave = (digest: boolean, marketing: boolean) => {
    setSaveStatus("saving");
    updateMutation.mutate({
      weeklyDigest: digest ? 1 : 0,
      marketingEmails: marketing ? 1 : 0,
    });
  };

  const handleToggle = (type: "digest" | "marketing") => {
    if (type === "digest") {
      const newValue = !weeklyDigest;
      setWeeklyDigest(newValue);
      handleSave(newValue, marketingEmails);
    } else {
      const newValue = !marketingEmails;
      setMarketingEmails(newValue);
      handleSave(weeklyDigest, newValue);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B] mx-auto mb-4"></div>
          <p className="text-gray-400">Načítání nastavení...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1A1A2E]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            <span className="text-[#F59E0B]">BOT</span>
            <span className="text-white">HUB</span>
          </button>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            Zpět na Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Nastavení notifikací</h1>
          <p className="text-gray-400">Spravujte své e-mailové preference a notifikace</p>
        </div>

        {/* Save Status */}
        {saveStatus !== "idle" && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              saveStatus === "saved"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : saveStatus === "error"
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
            }`}
          >
            {saveStatus === "saved" && <Check className="w-5 h-5" />}
            {saveStatus === "error" && <X className="w-5 h-5" />}
            {saveStatus === "saving" && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            )}
            <span>
              {saveStatus === "saved" && "Nastavení uloženo"}
              {saveStatus === "error" && "Chyba při ukládání"}
              {saveStatus === "saving" && "Ukládání..."}
            </span>
          </div>
        )}

        {/* Weekly Digest Card */}
        <Card className="mb-6 bg-[#1A1A2E] border-gray-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#F59E0B]/10 rounded-lg">
                  <Bell className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl mb-2">Týdenní přehled oblíbených iBotů</CardTitle>
                  <CardDescription className="text-gray-400">
                    Dostávejte každé pondělí v 9:00 personalizovaný e-mail s novinkami o vašich oblíbených iBotů,
                    speciálními nabídkami a aktualizacemi.
                  </CardDescription>
                </div>
              </div>
              <button
                onClick={() => handleToggle("digest")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  weeklyDigest ? "bg-[#F59E0B]" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    weeklyDigest ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              {weeklyDigest ? (
                <span className="text-green-400">✓ Zapnuto</span>
              ) : (
                <span className="text-gray-500">○ Vypnuto</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Marketing Emails Card */}
        <Card className="mb-6 bg-[#1A1A2E] border-gray-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#F59E0B]/10 rounded-lg">
                  <Mail className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl mb-2">Marketingové e-maily</CardTitle>
                  <CardDescription className="text-gray-400">
                    Dostávejte informace o nových iBotů, speciálních akcích, slevách a exkluzivních nabídkách pro
                    naše uživatele.
                  </CardDescription>
                </div>
              </div>
              <button
                onClick={() => handleToggle("marketing")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  marketingEmails ? "bg-[#F59E0B]" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    marketingEmails ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              {marketingEmails ? (
                <span className="text-green-400">✓ Zapnuto</span>
              ) : (
                <span className="text-gray-500">○ Vypnuto</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">
              💡 <strong className="text-white">Tip:</strong> Můžete se kdykoli odhlásit z e-mailů kliknutím na
              odkaz "Odhlásit se" v patičce každého e-mailu, nebo změnou nastavení zde.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
