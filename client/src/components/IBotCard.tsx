/**
 * IBot Card Component
 * Displays individual iBot with hover effects and category styling
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import type { IBot } from "@/data/ibots";
import { categories } from "@/data/ibots";
import { BotAvatar } from "@/components/BotAvatar";

interface IBotCardProps {
  bot: IBot;
  onClick?: () => void;
}

export default function IBotCard({ bot, onClick }: IBotCardProps) {
  const category = categories.find(c => c.id === bot.categoryId);
  const categoryColor = category?.color || "#D4AF37";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="bg-[#1A1A1F]/80 border-[#2A2A2F] hover:border-[#D4AF37]/50 transition-all duration-300 p-5 cursor-pointer group h-full"
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden transition-all duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `${categoryColor}15`,
              border: `1px solid ${categoryColor}30`
            }}
          >
            <BotAvatar name={bot.name} emoji={bot.avatar} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                  {bot.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1">{bot.category}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all shrink-0" />
            </div>
            
            {/* Specialty Badge */}
            <span 
              className="inline-flex items-center mt-2 text-xs px-2 py-1 rounded-md font-medium"
              style={{ 
                backgroundColor: `${categoryColor}15`,
                color: categoryColor
              }}
            >
              {bot.specialty}
            </span>
            
            {/* Description */}
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
              {bot.description}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-3">
              {bot.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-[#2A2A2F] text-gray-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Chat indicator on hover */}
        <div className="mt-4 pt-4 border-t border-[#2A2A2F] flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm text-gray-500">Zahájit konverzaci</span>
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Chat</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
