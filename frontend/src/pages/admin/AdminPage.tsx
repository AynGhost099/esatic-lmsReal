import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, BookOpen, Trash2, Search, Plus, Shield, GraduationCap, UserCheck } from "lucide-react";
import { adminService } from "@/services/adminService";
import type { User, Course, PaginatedResponse } from "@/types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";

type Tab = "users" | "courses";

const ROLE_COLORS: Record<string, "blue" | "orange" | "purple"> = {
  student: "blue",
  teacher: "orange",
  admin: "purple",
};

const ROLE_LABELS: Record<string, string> = {
  student: "Étudiant",
  teacher: "Enseignant",
  admin: "Admin",
};

const STATUS_COLORS: Record<string, "blue" | "orange" | "purple"> = {
  published: "blue",
  draft: "orange",
  archived: "purple",
};

function UserRow({ user, onDelete }: { user: User; onDelete: (u: User) => void }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-esatic-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user.first_name?.[0] ?? user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={ROLE_COLORS[user.role] ?? "blue"}>{ROLE_LABELS[user.role] ?? user.role}</Badge>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.is_verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {user.is_verified ? "Vérifié" : "Non vérifié"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onDelete(user)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

function CourseRow({ course, onDelete }: { course: Course; onDelete: (c: Course) => void }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} className="text-esatic-blue" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-800">{course.title}</p>
            <p className="text-xs text-gray-400">{course.teacher_name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={STATUS_COLORS[course.status] ?? "blue"}>
          {course.status === "published" ? "Publié" : course.status === "draft" ? "Brouillon" : "Archivé"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{course.enrolled_count} inscrits</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onDelete(course)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [toDelete, setToDelete] = useState<User | Course | null>(null);

  const { data: usersData, isLoading: usersLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ["admin-users", search, roleFilter],
    queryFn: () => adminService.listUsers({ search: search || undefined, role: roleFilter || undefined }),
    enabled: tab === "users",
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery<PaginatedResponse<Course>>({
    queryKey: ["admin-courses", search],
    queryFn: () => adminService.listCourses({ search: search || undefined }),
    enabled: tab === "courses",
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setToDelete(null);
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setToDelete(null);
    },
  });

  const isUser = (item: User | Course): item is User => "email" in item;

  const stats = [
    { label: "Utilisateurs", value: usersData?.count ?? "—", icon: Users, color: "bg-esatic-blue" },
    { label: "Étudiants", value: usersData?.results.filter((u) => u.role === "student").length ?? "—", icon: GraduationCap, color: "bg-green-500" },
    { label: "Enseignants", value: usersData?.results.filter((u) => u.role === "teacher").length ?? "—", icon: UserCheck, color: "bg-orange-500" },
    { label: "Cours", value: coursesData?.count ?? "—", icon: BookOpen, color: "bg-purple-500" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield size={28} className="text-esatic-blue" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Administration</h1>
          <p className="text-sm text-gray-500">Gérez les utilisateurs et les cours</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.color}`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {(["users", "courses"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(""); setRoleFilter(""); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              tab === t ? "bg-white text-esatic-blue shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "users" ? "Utilisateurs" : "Cours"}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={tab === "users" ? "Rechercher un utilisateur..." : "Rechercher un cours..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue"
          />
        </div>
        {tab === "users" && (
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue bg-white"
          >
            <option value="">Tous les rôles</option>
            <option value="student">Étudiants</option>
            <option value="teacher">Enseignants</option>
            <option value="admin">Admins</option>
          </select>
        )}
        <Button>
          <Plus size={14} className="mr-1" />
          {tab === "users" ? "Ajouter" : "Nouveau cours"}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {(tab === "users" ? usersLoading : coursesLoading) ? (
          <Spinner />
        ) : tab === "users" ? (
          usersData?.results.length === 0 ? (
            <EmptyState icon={Users} title="Aucun utilisateur" description="Aucun utilisateur trouvé." />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usersData?.results.map((u) => (
                  <UserRow key={u.id} user={u} onDelete={setToDelete} />
                ))}
              </tbody>
            </table>
          )
        ) : coursesData?.results.length === 0 ? (
          <EmptyState icon={BookOpen} title="Aucun cours" description="Aucun cours trouvé." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cours</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Inscrits</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coursesData?.results.map((c) => (
                <CourseRow key={c.id} course={c} onDelete={setToDelete} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Confirmer la suppression"
        size="sm"
      >
        {toDelete && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>{isUser(toDelete) ? toDelete.email : toDelete.title}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setToDelete(null)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={deleteUserMutation.isPending || deleteCourseMutation.isPending}
                onClick={() => {
                  if (isUser(toDelete)) deleteUserMutation.mutate(toDelete.id);
                  else deleteCourseMutation.mutate(toDelete.id);
                }}
              >
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
