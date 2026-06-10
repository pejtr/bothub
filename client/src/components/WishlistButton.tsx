import { Heart, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type Props = {
  ibotId: string;
  /** "icon" = bare heart overlay (catalog cards), "button" = labeled button (detail) */
  variant?: "icon" | "button";
  className?: string;
};

/**
 * Heart toggle to add/remove an iBot from the user's wishlist.
 * No-op (hidden) for unauthenticated visitors.
 */
export function WishlistButton({ ibotId, variant = "icon", className }: Props) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const inWishlist = trpc.wishlist.isInWishlist.useQuery(
    { ibotId },
    { enabled: isAuthenticated }
  );
  const add = trpc.wishlist.add.useMutation({
    onSuccess: () => { utils.wishlist.invalidate(); toast.success("Přidáno do oblíbených"); },
  });
  const remove = trpc.wishlist.remove.useMutation({
    onSuccess: () => { utils.wishlist.invalidate(); },
  });

  if (!isAuthenticated) return null;

  const active = inWishlist.data === true;
  const busy = add.isPending || remove.isPending || inWishlist.isLoading;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (busy) return;
    if (active) remove.mutate({ ibotId });
    else add.mutate({ ibotId });
  };

  if (variant === "button") {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
          active
            ? "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37]"
            : "bg-white/5 border-white/10 text-gray-300 hover:border-[#D4AF37]/30"
        } ${className ?? ""}`}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${active ? "fill-current" : ""}`} />}
        {active ? "V oblíbených" : "Přidat do oblíbených"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={active ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
      className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur transition-all ${
        active ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-black/30 text-gray-300 hover:text-[#D4AF37]"
      } ${className ?? ""}`}
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${active ? "fill-current" : ""}`} />}
    </button>
  );
}
