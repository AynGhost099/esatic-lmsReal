import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileText,
  MessageSquare,
  BarChart3,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import clsx from "clsx";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/courses", icon: BookOpen, label: "Cours" },
  { to: "/quizzes", icon: ClipboardList, label: "Quiz" },
  { to: "/assignments", icon: FileText, label: "Devoirs" },
  { to: "/forums", icon: MessageSquare, label: "Forums" },
  { to: "/profile", icon: User, label: "Profil" },
];

export default function Sidebar() {
  const { user } = useAuthStore();

  return (
    <aside className="w-64 bg-esatic-blue text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold">ESATIC LMS</h1>
        <p className="text-blue-300 text-sm mt-1">
          {user?.role === "admin" ? "Administrateur" : user?.role === "teacher" ? "Enseignant" : "Étudiant"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition",
                isActive
                  ? "bg-esatic-orange text-white"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-esatic-orange flex items-center justify-center text-sm font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="text-sm">
            <p className="font-medium">{user?.first_name} {user?.last_name}</p>
            <p className="text-blue-300 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
