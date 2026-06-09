import { getAvatarUrl } from "@/data/avatar-overrides";

type Props = {
  /** iBot name — used to look up a caricature avatar override */
  name: string;
  /** Emoji fallback (the catalog `avatar` field) */
  emoji: string;
  className?: string;
};

/**
 * Renders an iBot avatar: AI caricature <img> when an override exists for the
 * given name, otherwise the emoji fallback. Drop inside an existing styled
 * circle/square container — fills it via object-cover.
 */
export function BotAvatar({ name, emoji, className }: Props) {
  const url = getAvatarUrl(name);
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        loading="lazy"
        className={`w-full h-full object-cover rounded-[inherit] ${className ?? ""}`}
      />
    );
  }
  return <span className={className}>{emoji}</span>;
}
