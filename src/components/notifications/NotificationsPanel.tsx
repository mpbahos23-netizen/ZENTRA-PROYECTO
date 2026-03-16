import { Bell, Check, CheckCheck, Truck, CreditCard, Star, AlertCircle, Package } from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const typeIcons: Record<string, React.ReactNode> = {
  job_assigned: <Truck className="w-4 h-4 text-[#00e5ff]" />,
  carrier_en_route: <Truck className="w-4 h-4 text-blue-400" />,
  in_transit: <Package className="w-4 h-4 text-amber-400" />,
  delivered: <Check className="w-4 h-4 text-emerald-400" />,
  payment_processed: <CreditCard className="w-4 h-4 text-violet-400" />,
  rating_received: <Star className="w-4 h-4 text-amber-400" />,
  system: <AlertCircle className="w-4 h-4 text-zinc-400" />,
};

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <button
      onClick={() => !notification.read && onRead(notification.id)}
      className={`w-full text-left p-4 flex items-start gap-3 transition-colors hover:bg-white/5 ${
        notification.read ? 'opacity-60' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
        {typeIcons[notification.type] || typeIcons.system}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{notification.title}</p>
        {notification.body && (
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{notification.body}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-zinc-500 font-bold">{timeAgo(notification.created_at)}</span>
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-[#00e5ff]" />
        )}
      </div>
    </button>
  );
}

export default function NotificationsPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#00e5ff] text-black text-[10px] font-black flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 text-[#00e5ff]">({unreadCount})</span>
                )}
              </h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-zinc-400 hover:text-white h-auto p-1"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  Leer todas
                </Button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[320px] divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">Sin notificaciones</p>
                </div>
              ) : (
                notifications.map(n => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={markAsRead}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
