import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { communicationService } from "@/services/communicationService";
import type { Notification, PaginatedResponse } from "@/types";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery<PaginatedResponse<Notification>>({
    queryKey: ["notifications"],
    queryFn: () => communicationService.notifications(),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => communicationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.results ?? [];
  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-end px-6 flex-shrink-0">
      <div className="relative">
        <button onClick={() => setOpen((o) => !o)}
          className="relative p-2 text-gray-500 hover:text-esatic-blue hover:bg-blue-50 rounded-xl transition">
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-esatic-orange text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                {unread > 0 && (
                  <span className="text-xs bg-esatic-orange text-white px-2 py-0.5 rounded-full">{unread} nouvelles</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Aucune notification</div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 ${!n.is_read ? "bg-blue-50/50" : ""}`}>
                      {!n.is_read && (
                        <div className="w-2 h-2 bg-esatic-blue rounded-full flex-shrink-0 mt-1.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(n.created_at), "dd MMM HH:mm", { locale: fr })}
                        </p>
                      </div>
                      {!n.is_read && (
                        <button onClick={() => markReadMutation.mutate(n.id)}
                          className="p-1 text-gray-400 hover:text-green-500 rounded transition flex-shrink-0">
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
