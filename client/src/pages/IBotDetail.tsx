import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { ibots, categories, getIBotsByCategory } from "../data/ibots";
import { useI18n } from "../lib/i18n";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { IBotDetailSchema, BreadcrumbSchema } from "../components/SchemaOrg";
import { WishlistButton } from "../components/WishlistButton";
import { ArrowLeft, MessageCircle, Sparkles, Crown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function IBotDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t, locale } = useI18n();
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  const ibot = ibots.find(b => b.id === id);
  const category = ibot ? categories.find(c => c.id === ibot.category) : undefined;
  const relatedIBots = ibot ? getIBotsByCategory(ibot.category).filter(b => b.id !== ibot.id).slice(0, 3) : [];

  useEffect(() => {
    if (!ibot) {
      setLocation("/404");
    }
  }, [ibot, setLocation]);

  if (!ibot || !category) {
    return null;
  }

  const breadcrumbs = [
    { name: locale === "cs" ? "Domů" : "Home", url: "/" },
    { name: locale === "cs" ? "Katalog" : "Catalog", url: "/#catalog" },
    { name: locale === "cs" ? category.nameCs : category.name, url: `/#catalog` },
    { name: ibot.name, url: `/ibot/${ibot.id}` },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <IBotDetailSchema ibot={ibot} category={category} locale={locale} />
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">🤖</span>
              </div>
              <span className="text-xl font-bold font-[Space_Grotesk]">BOTHUB</span>
            </div>
          </Link>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === "cs" ? "Zpět na katalog" : "Back to catalog"}
          </Button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          {breadcrumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-4 h-4" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="text-white">{crumb.name}</span>
              ) : (
                <Link href={crumb.url}>
                  <span className="hover:text-amber-400 transition-colors cursor-pointer">{crumb.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: iBot Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              {ibot.imageUrl ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/30">
                  <img src={ibot.imageUrl} alt={ibot.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <span className="text-4xl">{category.icon}</span>
              )}
              <Badge style={{ backgroundColor: category.color }} className="text-white">
                {locale === "cs" ? category.nameCs : category.name}
              </Badge>
              {ibot.featured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-black gap-1">
                  <Crown className="w-3 h-3" />
                  FEATURED
                </Badge>
              )}
            </div>

            <h1 className="text-5xl font-bold mb-6 font-[Space_Grotesk] bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
              {ibot.name}
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {ibot.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {ibot.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="border-amber-500/30 text-amber-400">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold gap-2"
                onClick={() => setRegistrationModalOpen(true)}
              >
                <Sparkles className="w-5 h-5" />
                {locale === "cs" ? "Vyzkoušet zdarma" : "Try for free"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-amber-500/30 hover:bg-amber-500/10 gap-2"
                onClick={() => setLocation("/#pricing")}
              >
                <MessageCircle className="w-5 h-5" />
                {locale === "cs" ? "Zobrazit ceny" : "View pricing"}
              </Button>
              <WishlistButton ibotId={ibot.id} ibotName={ibot.name} variant="icon" />
            </div>
          </motion.div>

          {/* Right: Demo Chatbox Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1E] border-amber-500/20 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-bold font-[Space_Grotesk]">{ibot.name}</h3>
                  <p className="text-sm text-gray-400">{locale === "cs" ? "AI Asistent" : "AI Assistant"}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm">{locale === "cs" ? "Jak mohu zvýšit své prodeje?" : "How can I increase my sales?"}</p>
                  </div>
                </div>

                {/* iBot Response */}
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-gray-300">
                      {locale === "cs"
                        ? `Skvělá otázka! Zaměřte se na 3 klíčové oblasti: 1) Vytvořte nabídku, kterou zákazník nemůže odmítnout (Value Equation), 2) Optimalizujte prodejní funnel, 3) Testujte a měřte vše. Chcete se ponořit do detailů některé z těchto oblastí?`
                        : `Great question! Focus on 3 key areas: 1) Create an offer customers can't refuse (Value Equation), 2) Optimize your sales funnel, 3) Test and measure everything. Want to dive deeper into any of these areas?`}
                    </p>
                  </div>
                </div>

                {/* User Follow-up */}
                <div className="flex justify-end">
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm">{locale === "cs" ? "Ano, řekni mi víc o Value Equation" : "Yes, tell me more about Value Equation"}</p>
                  </div>
                </div>

                {/* iBot Detailed Response */}
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-gray-300">
                      {locale === "cs"
                        ? `Value Equation = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice). Zvyšte hodnotu tím, že: 1) Slibujete větší výsledek, 2) Zvýšíte důvěru v dosažení výsledku, 3) Zkrátíte čas do výsledku, 4) Snížíte potřebné úsilí. Aplikujme to na váš produkt...`
                        : `Value Equation = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice). Increase value by: 1) Promising bigger results, 2) Increasing trust in achieving results, 3) Shortening time to results, 4) Reducing required effort. Let's apply this to your product...`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
                  onClick={() => setRegistrationModalOpen(true)}
                >
                  {locale === "cs" ? "Začít konverzaci" : "Start conversation"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Related iBots */}
      {relatedIBots.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 font-[Space_Grotesk]">
            {locale === "cs" ? "Podobní iBoti" : "Similar iBots"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedIBots.map(bot => (
              <Link key={bot.id} href={`/ibot/${bot.id}`}>
                <Card className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1E] border-amber-500/20 p-6 hover:border-amber-500/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{categories.find(c => c.id === bot.category)?.icon}</span>
                    <h3 className="font-bold font-[Space_Grotesk] group-hover:text-amber-400 transition-colors">{bot.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{bot.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {bot.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-500/30 p-12 text-center">
          <h2 className="text-4xl font-bold mb-4 font-[Space_Grotesk]">
            {locale === "cs" ? "Připraveni začít?" : "Ready to start?"}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {locale === "cs"
              ? `Získejte přístup k ${ibot.name} a dalším 87 AI osobnostem. Začněte zdarma, bez kreditní karty.`
              : `Get access to ${ibot.name} and 87 other AI personalities. Start free, no credit card required.`}
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg px-8 py-6"
            onClick={() => setRegistrationModalOpen(true)}
          >
            {locale === "cs" ? "Vyzkoušet zdarma" : "Try for free"}
          </Button>
        </Card>
      </section>
    </div>
  );
}
