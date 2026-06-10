/**
 * Affiliate Leaderboard Component
 * Shows anonymized ranking of top affiliate partners to drive competition
 */

import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp,
  Flame,
  Loader2,
  Users
} from "lucide-react";
import { useState, useMemo } from "react";

const rankIcons = [
  { icon: Crown, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/20", border: "border-[#D4AF37]/40" },
  { icon: Medal, color: "text-gray-300", bg: "bg-gray-300/20", border: "border-gray-300/40" },
  { icon: Medal, color: "text-amber-600", bg: "bg-amber-600/20", border: "border-amber-600/40" },
];

export default function AffiliateLeaderboard() {
  const [period, setPeriod] = useState<"monthly" | "alltime">("alltime");

  const { data: leaderboard, isLoading } = trpc.affiliate.getLeaderboard.useQuery(
    { period, limit: 10 },
  );

  const hasData = leaderboard && leaderboard.length > 0;

  return (
    <Card className="bg-[#1A1A1F] border-[#2A2A2F] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#2A2A2F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#D4AF37]" />
          Leaderboard
        </h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={period === "monthly" ? "default" : "outline"}
            className={period === "monthly"
              ? "bg-[#D4AF37] text-[#0A0A0F] hover:bg-[#D4AF37]/90"
              : "border-[#2A2A2F] text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]"
            }
            onClick={() => setPeriod("monthly")}
          >
            <Flame className="w-3 h-3 mr-1" />
            Tento měsíc
          </Button>
          <Button
            size="sm"
            variant={period === "alltime" ? "default" : "outline"}
            className={period === "alltime"
              ? "bg-[#D4AF37] text-[#0A0A0F] hover:bg-[#D4AF37]/90"
              : "border-[#2A2A2F] text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]"
            }
            onClick={() => setPeriod("alltime")}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Celkově
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto" />
        </div>
      ) : !hasData ? (
        <div className="p-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p>Zatím žádní partneři v žebříčku</p>
          <p className="text-sm mt-1">Buďte první, kdo se dostane na vrchol!</p>
        </div>
      ) : (
        <div className="divide-y divide-[#2A2A2F]/50">
          {leaderboard.map((entry, index) => {
            const rankConfig = rankIcons[index] || null;
            const isTopThree = index < 3;

            return (
              <div
                key={`${entry.rank}-${entry.displayName}`}
                className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                  isTopThree ? "bg-[#D4AF37]/5" : "hover:bg-[#2A2A2F]/20"
                }`}
              >
                {/* Rank */}
                <div className="w-10 flex-shrink-0">
                  {rankConfig ? (
                    <div className={`w-10 h-10 rounded-xl ${rankConfig.bg} border ${rankConfig.border} flex items-center justify-center`}>
                      <rankConfig.icon className={`w-5 h-5 ${rankConfig.color}`} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#2A2A2F] flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold truncate ${isTopThree ? "text-white" : "text-gray-300"}`}>
                    {entry.displayName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {entry.totalSales} {entry.totalSales === 1 ? "prodej" : entry.totalSales < 5 ? "prodeje" : "prodejů"}
                  </div>
                </div>

                {/* Earnings */}
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold ${isTopThree ? "text-[#D4AF37]" : "text-gray-300"}`}>
                    {(entry.totalEarnings / 100).toLocaleString("cs-CZ")} Kč
                  </div>
                  {isTopThree && (
                    <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 text-[10px]">
                      Top {entry.rank}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer motivation */}
      <div className="p-4 border-t border-[#2A2A2F] bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
        <p className="text-xs text-gray-400 text-center">
          Sdílejte svůj affiliate odkaz a soutěžte o pozici v žebříčku. 
          Top partneři získávají exkluzivní bonusy!
        </p>
      </div>
    </Card>
  );
}
