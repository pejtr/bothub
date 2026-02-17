import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

interface WishlistButtonProps {
  ibotId: string;
  ibotName: string;
  variant?: "default" | "icon";
  className?: string;
}

export function WishlistButton({ ibotId, ibotName, variant = "default", className }: WishlistButtonProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const utils = trpc.useUtils();

  // Check if in wishlist
  const { data: isInWishlist } = trpc.wishlist.isInWishlist.useQuery(
    { ibotId },
    { enabled: !!user }
  );

  // Add to wishlist mutation
  const addMutation = trpc.wishlist.add.useMutation({
    onMutate: async () => {
      // Optimistic update
      await utils.wishlist.isInWishlist.cancel({ ibotId });
      const previous = utils.wishlist.isInWishlist.getData({ ibotId });
      utils.wishlist.isInWishlist.setData({ ibotId }, true);
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous !== undefined) {
        utils.wishlist.isInWishlist.setData({ ibotId }, context.previous);
      }
      toast.error(t("wishlist.addError"));
    },
    onSuccess: () => {
      utils.wishlist.count.invalidate();
      utils.wishlist.list.invalidate();
      toast.success(t("wishlist.added", { name: ibotName }));
    },
  });

  // Remove from wishlist mutation
  const removeMutation = trpc.wishlist.remove.useMutation({
    onMutate: async () => {
      // Optimistic update
      await utils.wishlist.isInWishlist.cancel({ ibotId });
      const previous = utils.wishlist.isInWishlist.getData({ ibotId });
      utils.wishlist.isInWishlist.setData({ ibotId }, false);
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous !== undefined) {
        utils.wishlist.isInWishlist.setData({ ibotId }, context.previous);
      }
      toast.error(t("wishlist.removeError"));
    },
    onSuccess: () => {
      utils.wishlist.count.invalidate();
      utils.wishlist.list.invalidate();
      toast.success(t("wishlist.removed", { name: ibotName }));
    },
  });

  const handleClick = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }

    if (isInWishlist) {
      removeMutation.mutate({ ibotId });
    } else {
      addMutation.mutate({ ibotId });
    }
  };

  const isLoading = addMutation.isPending || removeMutation.isPending;

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`p-2 rounded-full transition-all hover:scale-110 ${
          isInWishlist
            ? "text-amber-500 hover:text-amber-600"
            : "text-gray-400 hover:text-amber-500"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${className || ""}`}
        aria-label={isInWishlist ? t("wishlist.removeFromWishlist") : t("wishlist.addToWishlist")}
      >
        <Heart
          className="w-5 h-5"
          fill={isInWishlist ? "currentColor" : "none"}
          strokeWidth={2}
        />
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={isInWishlist ? "default" : "outline"}
      className={`gap-2 ${className || ""}`}
    >
      <Heart
        className="w-4 h-4"
        fill={isInWishlist ? "currentColor" : "none"}
        strokeWidth={2}
      />
      {isInWishlist ? t("wishlist.inWishlist") : t("wishlist.addToWishlist")}
    </Button>
  );
}
