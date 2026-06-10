import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getIBotById } from "@/data/ibots";
import IBotCard from "@/components/IBotCard";
import ChatModal from "@/components/ChatModal";
import type { IBot } from "@/data/ibots";
import { Heart, ArrowLeft, Bot } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Wishlist() {
  const { isAuthenticated, loading } = useAuth();
  const wishlist = trpc.wishlist.list.useQuery(undefined, { enabled: isAuthenticated });
  const [selectedBot, setSelectedBot] = useState<IBot | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const bots = (wishlist.data ?? [])
    .map((w) => getIBotById(w.ibotId))
    .filter((b): b is IBot => Boolean(b));

  const openChat = (bot: IBot) => { setSelectedBot(bot); setChatOpen(true); };

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
              <ArrowLeft className="w-4 h-4" /> Zpět na katalog
            </button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#D4AF37] fill-current" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Moji oblíbení iBoti</h1>
            <p className="text-gray-500 text-sm">Vaše uložená kolekce AI osobností</p>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-16">Načítám...</p>
        ) : !isAuthenticated ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">Pro zobrazení oblíbených se přihlaste.</p>
            <button
              onClick={() => (window.location.href = getLoginUrl())}
              className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-medium hover:bg-[#E5C04B] transition-colors"
            >
              Přihlásit se
            </button>
          </div>
        ) : bots.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 mb-2">Zatím nemáte žádné oblíbené iBoty.</p>
            <p className="text-gray-600 text-sm mb-6">Procházejte katalog a klikněte na srdíčko u iBota.</p>
            <Link href="/">
              <button className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-medium hover:bg-[#E5C04B] transition-colors">
                Procházet katalog
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map((bot) => (
              <IBotCard key={bot.id} bot={bot} onClick={() => openChat(bot)} />
            ))}
          </div>
        )}
      </div>

      {selectedBot && (
        <ChatModal bot={selectedBot} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      )}
    </div>
  );
}
