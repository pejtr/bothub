import { Star, Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const testimonials = [
  {
    name: "Martin Dvořák",
    role: "CEO, TechFlow s.r.o.",
    avatar: "MD",
    rating: 5,
    textCs: "Za první měsíc s iBoty jsme zvýšili konverze o 38 %. Náš prodejní iBot odpovídá zákazníkům 24/7 a uzavírá obchody i v noci. ROI se nám vrátila za 12 dní.",
    textEn: "In the first month with iBots, we increased conversions by 38%. Our sales iBot responds to customers 24/7 and closes deals even at night. ROI paid back in 12 days.",
    metricCs: "+38% konverze",
    metricEn: "+38% conversion",
    metricColor: "text-amber-400",
    plan: "GOLD",
  },
  {
    name: "Petra Svobodová",
    role: "Marketing Director, E-shop Krása",
    avatar: "PS",
    rating: 5,
    textCs: "Přešli jsme z klasického chatbotu na iBoty a rozdíl je obrovský. Zákazníci si myslí, že mluví s reálným člověkem. Spokojenost zákazníků vzrostla o 45 % a reklamace klesly o třetinu.",
    textEn: "We switched from a traditional chatbot to iBots and the difference is huge. Customers think they're talking to a real person. Customer satisfaction increased by 45% and complaints dropped by a third.",
    metricCs: "+45% spokojenost",
    metricEn: "+45% satisfaction",
    metricColor: "text-purple-400",
    plan: "DIAMOND",
  },
  {
    name: "Jakub Novotný",
    role: "Freelance konzultant",
    avatar: "JN",
    rating: 5,
    textCs: "Díky affiliate programu BOTHUB vydělávám pasivně přes 30 000 Kč měsíčně. Stačilo doporučit iBoty svým klientům. 88% provize z každé platby je neskutečný deal.",
    textEn: "Thanks to the BOTHUB affiliate program, I passively earn over $1,200/month. All I had to do was recommend iBots to my clients. 88% commission on every payment is an incredible deal.",
    metricCs: "30 000+ Kč/měs",
    metricEn: "$1,200+/mo",
    metricColor: "text-green-400",
    plan: "AFFILIATE",
  },
];

export function Testimonials() {
  const { locale, t } = useI18n();

  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.015] to-transparent" />
      <div className="container relative z-10">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-amber-400 tracking-wider uppercase mb-3 block">
            {locale === "en" ? "Testimonials" : "Reference"}
          </span>
          <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold">
            {locale === "en" ? "What our " : "Co říkají naši "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
              {locale === "en" ? "happy customers say" : "spokojení zákazníci"}
            </span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
            {locale === "en"
              ? "Real results from companies and entrepreneurs who deployed iBots."
              : "Reálné výsledky od firem a podnikatelů, kteří nasadili iBoty."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col group hover:border-amber-500/20 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-amber-500/20 mb-4" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{locale === "en" ? item.textEn : item.textCs}&rdquo;
              </p>
              <div className="mb-4">
                <span className={`text-sm font-bold ${item.metricColor}`}>
                  {locale === "en" ? item.metricEn : item.metricCs}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {locale === "en" ? `plan ${item.plan}` : `plán ${item.plan}`}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-amber-400">
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-white">500+</p>
            <p className="text-xs text-gray-500">{locale === "en" ? "Active companies" : "Aktivních firem"}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-2xl font-bold text-amber-400">4.9/5</p>
            <p className="text-xs text-gray-500">{locale === "en" ? "Average rating" : "Průměrné hodnocení"}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-2xl font-bold text-white">{locale === "en" ? "12 days" : "12 dní"}</p>
            <p className="text-xs text-gray-500">{locale === "en" ? "Average payback" : "Průměrná návratnost"}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-2xl font-bold text-purple-400">89%</p>
            <p className="text-xs text-gray-500">{locale === "en" ? "Customer satisfaction" : "Spokojenost zákazníků"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
