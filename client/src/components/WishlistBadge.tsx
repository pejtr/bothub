import { Heart } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export function WishlistBadge() {
  const { data: count } = trpc.wishlist.count.useQuery();

  return (
    <Link href="/wishlist">
      <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
        <Heart className="w-5 h-5 text-gray-400 hover:text-amber-400 transition-colors" />
        {count !== undefined && count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
    </Link>
  );
}
