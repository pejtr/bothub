import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { ibots } from "@/data/ibots";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/WishlistButton";
import { Heart, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getLoginUrl } from "@/const";

export default function Wishlist() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { t, locale } = useI18n();
  const { data: wishlistItems, isLoading } = trpc.wishlist.list.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      window.location.href = getLoginUrl();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const wishlistIBots = wishlistItems?.map(item => ibots.find(ibot => ibot.id === item.ibotId)).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
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
            {locale === "cs" ? "Zpět na homepage" : "Back to homepage"}
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Heart className="w-10 h-10 text-amber-500" fill="currentColor" />
          <h1 className="text-4xl font-bold font-[Space_Grotesk]">{t("wishlist.title")}</h1>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1E] border-amber-500/20 p-6 animate-pulse">
                <div className="h-32 bg-white/10 rounded-lg mb-4"></div>
                <div className="h-6 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </Card>
            ))}
          </div>
        ) : wishlistIBots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Heart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">{t("wishlist.empty")}</h2>
            <p className="text-gray-400 mb-8">{t("wishlist.emptyDesc")}</p>
            <Button
              onClick={() => setLocation("/#catalog")}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {t("wishlist.browseCatalog")}
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistIBots.map((ibot, index) => {
              if (!ibot) return null;
              return (
                <motion.div
                  key={ibot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1E] border-amber-500/20 p-6 hover:border-amber-500/40 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{ibot.name.charAt(0)}</span>
                        <div>
                          <h3 className="text-xl font-bold">{ibot.name}</h3>
                          <Badge variant="outline" className="border-amber-500/30 text-amber-400 mt-1">
                            {ibot.category}
                          </Badge>
                        </div>
                      </div>
                      <WishlistButton ibotId={ibot.id} ibotName={ibot.name} variant="icon" />
                    </div>

                    <p className="text-gray-400 mb-4 line-clamp-3">{ibot.description}</p>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setLocation(`/ibot/${ibot.id}`)}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
                      >
                        {locale === "cs" ? "Zobrazit detail" : "View details"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
