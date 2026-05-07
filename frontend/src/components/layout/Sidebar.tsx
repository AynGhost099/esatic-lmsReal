import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, ClipboardList, FileText,
  MessageSquare, User, Shield, LogOut, GraduationCap, Star,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import clsx from "clsx";

const studentNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/courses", icon: BookOpen, label: "Cours" },
  { to: "/quizzes", icon: ClipboardList, label: "Quiz" },
  { to: "/assignments", icon: FileText, label: "Devoirs" },
  { to: "/forums", icon: MessageSquare, label: "Forums" },
  { to: "/profile", icon: User, label: "Profil" },
];

const teacherNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/teacher/courses", icon: BookOpen, label: "Mes cours" },
  { to: "/teacher/grades", icon: Star, label: "Notes" },
  { to: "/forums", icon: MessageSquare, label: "Forums" },
  { to: "/profile", icon: User, label: "Profil" },
];

const adminNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/courses", icon: BookOpen, label: "Cours" },
  { to: "/quizzes", icon: ClipboardList, label: "Quiz" },
  { to: "/assignments", icon: FileText, label: "Devoirs" },
  { to: "/forums", icon: MessageSquare, label: "Forums" },
  { to: "/admin", icon: Shield, label: "Administration" },
  { to: "/profile", icon: User, label: "Profil" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  const navItems = user?.role === "admin" ? adminNav : user?.role === "teacher" ? teacherNav : studentNav;

  return (
    <aside className="w-64 bg-esatic-blue text-white flex flex-col shadow-xl flex-shrink-0">
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-2">
          <GraduationCap size={24} className="text-esatic-orange" />
          <h1 className="text-xl font-bold">ESATIC LMS</h1>
        </div>
        <p className="text-blue-300 text-sm mt-1">
          {user?.role === "admin" ? "Administrateur" : user?.role === "teacher" ? "Enseignant" : "Étudiant"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/dashboard"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition",
                isActive
                  ? "bg-esatic-orange text-white"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              )
            }>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-esatic-orange flex items-center justify-center text-sm font-bold flex-shrink-0">
            {(user?.first_name?.[0] ?? user?.email[0] ?? "?").toUpperCase()}
          </div>
          <div className="text-sm min-w-0">
            <p className="font-medium truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-blue-300 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-blue-300 hover:text-white hover:bg-blue-800 rounded-lg transition">
          <LogOut size={14} /> Se déconnecter
        </button>
      </div>
    </aside>
  );
}
