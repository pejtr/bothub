import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import {
  Bell, CheckCircle2, Crown, Shield, Users, TrendingUp,
  Zap, X, Check, ExternalLink
} from "lucide-react";
import { Link } from "wouter";

const typeIcons: Record<string, React.ReactNode> = {
  registration: <Crown className="w-4 h-4 text-amber-400" />,
  affiliate: <Users className="w-4 h-4 text-green-400" />,
  milestone: <TrendingUp className="w-4 h-4 text-purple-400" />,
  system: <Zap className="w-4 h-4 text-blue-400" />,
  payment: <Shield className="w-4 h-4 text-emerald-400" />,
};

const typeBg: Record<string, string> = {
  registration: "bg-amber-500/10",
  affiliate: "bg-green-500/10",
  milestone: "bg-purple-500/10",
  system: "bg-blue-500/10",
  payment: "bg-emerald-500/10",
};

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { locale } = useI18n();
  const t = locale === "cs";
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: notifications, refetch: refetchNotifications } = trpc.notifications.list.useQuery(
    undefined,
    { enabled: isAuthenticated && isOpen }
  );

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => { refetchNotifications(); },
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => { refetchNotifications(); },
  });

  const utils = trpc.useUtils();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const unreadCount = unreadData?.count ?? 0;

  const handleMarkRead = (id: number) => {
    markRead.mutate({ notificationId: id }, {
      onSuccess: () => { utils.notifications.unreadCount.invalidate(); },
    });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => { utils.notifications.unreadCount.invalidate(); },
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return t ? "právě teď" : "just now";
    if (mins < 60) return t ? `před ${mins}m` : `${mins}m ago`;
    if (hours < 24) return t ? `před ${hours}h` : `${hours}h ago`;
    return t ? `před ${days}d` : `${days}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-[#12121A] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-[100] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="font-semibold text-white text-sm">
              {t ? "Notifikace" : "Notifications"}
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-amber-400">({unreadCount} {t ? "nových" : "new"})</span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-gray-400 hover:text-amber-400 transition-colors"
                >
                  {t ? "Přečíst vše" : "Mark all read"}
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {t ? "Žádné notifikace" : "No notifications"}
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                    !notif.isRead ? "bg-amber-500/[0.03]" : ""
                  }`}
                >
                  <div className={`shrink-0 p-2 rounded-lg ${typeBg[notif.type]}`}>
                    {typeIcons[notif.type] || typeIcons.system}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${!notif.isRead ? "text-white" : "text-gray-300"}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="shrink-0 text-gray-500 hover:text-amber-400 transition-colors"
                          title={t ? "Označit jako přečtené" : "Mark as read"}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-600">{formatTime(notif.createdAt)}</span>
                      {notif.actionUrl && (
                        <Link href={notif.actionUrl} onClick={() => setIsOpen(false)}>
                          <span className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer">
                            {t ? "Zobrazit" : "View"} <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-white/5 text-center">
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <span className="text-xs text-gray-400 hover:text-amber-400 transition-colors cursor-pointer">
                  {t ? "Zobrazit vše v dashboardu" : "View all in dashboard"}
                </span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
