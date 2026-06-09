/**
 * BotHub Ecosystem Badge
 * Shows iBots as part of the BotHub.cz ecosystem with cross-platform navigation
 */

import { ExternalLink, Globe } from "lucide-react";

const BOTHUB_URL = "https://bothub.cz";

interface BotHubBadgeProps {
  variant?: "nav" | "hero" | "footer" | "inline";
  className?: string;
}

export default function BotHubBadge({ variant = "inline", className = "" }: BotHubBadgeProps) {
  if (variant === "nav") {
    return (
      <a
        href={BOTHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#D4AF37] transition-colors group ${className}`}
      >
        <Globe className="w-3 h-3" />
        <span>BotHub.cz</span>
        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  if (variant === "hero") {
    return (
      <a
        href={BOTHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A1F]/80 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all group ${className}`}
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
          <Globe className="w-3 h-3 text-[#0A0A0F]" />
        </div>
        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
          Součást ekosystému <span className="text-[#D4AF37] font-semibold">BotHub.cz</span>
        </span>
        <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-[#D4AF37] transition-colors" />
      </a>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        <a
          href={BOTHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-[#8B7355]/20 border border-[#D4AF37]/30 flex items-center justify-center group-hover:border-[#D4AF37]/60 transition-colors">
            <Globe className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
              BotHub.cz
            </div>
            <div className="text-xs text-gray-500">
              Hlavní platforma AI chatbotů
            </div>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-[#D4AF37] transition-colors ml-1" />
        </a>
        <p className="text-xs text-gray-600 leading-relaxed">
          iBots je prémiová kolekce AI osobností v rámci ekosystému BotHub.cz — 
          kompletní platformy pro AI chatboty s 77+ expertními osobnostmi.
        </p>
      </div>
    );
  }

  // Default inline variant
  return (
    <a
      href={BOTHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors ${className}`}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>Součást BotHub.cz</span>
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

export { BOTHUB_URL };
