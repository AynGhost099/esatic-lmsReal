import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { Notification } from "@/types";

export default function Header() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const { data: notifications } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => api.get<{ results: Notification[] }>("/communication/notifications/").then((r) => r.data.results),
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end gap-4">
      <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-esatic-orange text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition"
      >
        <LogOut size={16} />
        Déconnexion
      </button>
    </header>
  );
}
