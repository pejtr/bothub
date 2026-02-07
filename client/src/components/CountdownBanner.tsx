import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Flame, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CountdownBannerProps {
  onClaim: () => void;
}

export function CountdownBanner({ onClaim }: CountdownBannerProps) {
  const { t } = useI18n();
  const { data: promo } = trpc.promo.remainingSpots.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const endDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;
      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const remaining = promo?.remaining ?? 100;
  const taken = promo?.taken ?? 0;
  const isActive = promo?.isActive ?? true;
  const progressPercent = Math.min(100, (taken / 100) * 100);

  if (!isActive) return null;

  return (
    <section className="relative py-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10" />
      <div className="absolute inset-0 bg-[#0A0A0F]/60" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse" />

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 shrink-0">
              <Flame className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider animate-pulse">
                  {t("countdown.label")}
                </span>
                <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">
                  {t("countdown.spots", { remaining })}
                </span>
              </div>
              <h3 className="font-[Space_Grotesk] text-lg md:text-xl font-bold text-white">
                {t("countdown.title")}{" "}
                <span className="text-gradient-gold">{t("countdown.offer")}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex gap-2">
              {[
                { value: timeLeft.days, label: t("countdown.days") },
                { value: timeLeft.hours, label: t("countdown.hours") },
                { value: timeLeft.minutes, label: t("countdown.minutes") },
                { value: timeLeft.seconds, label: t("countdown.seconds") },
              ].map((unit, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="bg-black/50 border border-amber-500/20 rounded-lg px-2.5 py-1.5 min-w-[44px] text-center">
                    <span className="font-[Space_Grotesk] text-xl font-bold text-amber-400 tabular-nums">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">{unit.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-2">
            <Button
              onClick={onClaim}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-6 py-2.5 pulse-gold"
            >
              <Zap className="w-4 h-4 mr-1" />
              {t("countdown.cta")}
            </Button>
            <div className="w-full max-w-[200px]">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>{t("countdown.taken", { taken })}</span>
                <span className="text-amber-400">{t("countdown.free", { remaining })}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
