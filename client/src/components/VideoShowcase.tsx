import { useState } from "react";
import { Play, Bot, TrendingUp, HeadphonesIcon, Users, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface VideoDemo {
  id: string;
  titleCs: string;
  titleEn: string;
  descCs: string;
  descEn: string;
  catCs: string;
  catEn: string;
  icon: React.ReactNode;
  duration: string;
  statsCs: string;
  statsEn: string;
  color: string;
}

const videoDemos: VideoDemo[] = [
  {
    id: "sales",
    titleCs: "Prodejní iBot v akci",
    titleEn: "Sales iBot in Action",
    descCs: "Sledujte, jak AI chatbot identifikuje potřeby zákazníka, překonává námitky a uzavírá obchod — vše automaticky za 3 minuty.",
    descEn: "Watch how an AI chatbot identifies customer needs, overcomes objections, and closes the deal — all automatically in 3 minutes.",
    catCs: "Prodej & Marketing",
    catEn: "Sales & Marketing",
    icon: <TrendingUp className="w-5 h-5" />,
    duration: "2:47",
    statsCs: "+42 % konverze",
    statsEn: "+42% conversion",
    color: "amber",
  },
  {
    id: "support",
    titleCs: "Zákaznická podpora 24/7",
    titleEn: "24/7 Customer Support",
    descCs: "Ukázka, jak iBot řeší reklamaci, nabízí alternativy a mění nespokojeného zákazníka na loajálního — bez lidského zásahu.",
    descEn: "See how iBot handles complaints, offers alternatives, and turns unhappy customers into loyal ones — without human intervention.",
    catCs: "Zákaznická podpora",
    catEn: "Customer Support",
    icon: <HeadphonesIcon className="w-5 h-5" />,
    duration: "3:12",
    statsCs: "89 % spokojenost",
    statsEn: "89% satisfaction",
    color: "purple",
  },
  {
    id: "affiliate",
    titleCs: "Affiliate systém v praxi",
    titleEn: "Affiliate System in Practice",
    descCs: "Jak affiliate partner generuje pasivní příjem sdílením iBotů. Reálný příklad: 30 000+ Kč/měsíc s 88% provizí.",
    descEn: "How an affiliate partner generates passive income sharing iBots. Real example: $1,200+/month with 88% commission.",
    catCs: "Affiliate program",
    catEn: "Affiliate Program",
    icon: <Users className="w-5 h-5" />,
    duration: "4:05",
    statsCs: "88 % provize",
    statsEn: "88% commission",
    color: "emerald",
  },
];

export function VideoShowcase() {
  const { t, locale } = useI18n();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  const l = (v: VideoDemo, field: "title" | "desc" | "cat" | "stats") => {
    const csKey = `${field}Cs` as keyof VideoDemo;
    const enKey = `${field}En` as keyof VideoDemo;
    return locale === "en" ? (v[enKey] as string) : (v[csKey] as string);
  };

  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", glow: "bg-amber-500/20" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", glow: "bg-purple-500/20" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", glow: "bg-emerald-500/20" },
  };

  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
      <div className="container relative z-10">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-amber-400 tracking-wider uppercase mb-3 block">
            {t("video.label")}
          </span>
          <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold">
            {t("video.title1")}<span className="text-gradient-gold">{t("video.title2")}</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">{t("video.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {videoDemos.map((video) => {
            const colors = colorMap[video.color];
            const isHovered = hoveredVideo === video.id;
            return (
              <div
                key={video.id}
                className={`group relative rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-sm overflow-hidden transition-all duration-500 cursor-pointer ${
                  isHovered ? "scale-[1.02] shadow-2xl" : ""
                }`}
                onMouseEnter={() => setHoveredVideo(video.id)}
                onMouseLeave={() => setHoveredVideo(null)}
                onClick={() => setActiveVideo(video.id)}
              >
                <div className="relative aspect-video bg-black/40 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`absolute inset-0 ${colors.glow} opacity-20`} />
                    <div className="relative flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center transition-all duration-300 ${
                        isHovered ? "scale-110" : ""
                      }`}>
                        <Bot className={`w-8 h-8 ${colors.text}`} />
                      </div>
                      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}>
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                          <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded">
                    {video.duration}
                  </div>
                  <div className={`absolute top-2 left-2 ${colors.bg} backdrop-blur-sm ${colors.text} text-xs px-2 py-0.5 rounded border ${colors.border}`}>
                    {l(video, "cat")}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={colors.text}>{video.icon}</span>
                    <h3 className="font-[Space_Grotesk] font-bold text-white">{l(video, "title")}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">{l(video, "desc")}</p>
                  <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${colors.text} ${colors.bg} px-2.5 py-1 rounded-full border ${colors.border}`}>
                    <TrendingUp className="w-3 h-3" />
                    {l(video, "stats")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">{t("video.note")}</p>
      </div>

      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
          <div className="relative bg-[#111118] rounded-2xl border border-white/10 max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveVideo(null)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="aspect-video bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="font-[Space_Grotesk] text-xl font-bold text-white mb-2">
                  {videoDemos.find(v => v.id === activeVideo) && l(videoDemos.find(v => v.id === activeVideo)!, "title")}
                </h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
                  {videoDemos.find(v => v.id === activeVideo) && l(videoDemos.find(v => v.id === activeVideo)!, "desc")}
                </p>
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm">
                  <Play className="w-4 h-4" />
                  {t("video.coming")}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    {videoDemos.find(v => v.id === activeVideo) && l(videoDemos.find(v => v.id === activeVideo)!, "cat")}
                  </span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-sm text-gray-400">
                    {videoDemos.find(v => v.id === activeVideo)?.duration}
                  </span>
                </div>
                <span className="text-sm font-semibold text-amber-400">
                  {videoDemos.find(v => v.id === activeVideo) && l(videoDemos.find(v => v.id === activeVideo)!, "stats")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
