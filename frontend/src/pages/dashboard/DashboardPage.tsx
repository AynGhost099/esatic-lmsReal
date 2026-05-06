import { useQuery } from "@tanstack/react-query";
import { BookOpen, ClipboardList, FileText, TrendingUp } from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

interface DashboardData {
  enrolled_courses?: number;
  completed_courses?: number;
  pending_assignments?: number;
  total_courses?: number;
  total_students?: number;
  pending_grading?: number;
  total_users?: number;
  total_enrollments?: number;
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/reporting/dashboard/").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esatic-blue"></div>
      </div>
    );
  }

  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour, {user?.first_name} !
        </h1>
        <p className="text-gray-500 mt-1">Voici votre tableau de bord</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isStudent && (
          <>
            <StatCard icon={BookOpen} label="Cours inscrits" value={data?.enrolled_courses ?? 0} color="bg-blue-500" />
            <StatCard icon={TrendingUp} label="Cours terminés" value={data?.completed_courses ?? 0} color="bg-green-500" />
            <StatCard icon={FileText} label="Devoirs en attente" value={data?.pending_assignments ?? 0} color="bg-orange-500" />
          </>
        )}
        {isTeacher && (
          <>
            <StatCard icon={BookOpen} label="Mes cours" value={data?.total_courses ?? 0} color="bg-blue-500" />
            <StatCard icon={ClipboardList} label="Étudiants" value={data?.total_students ?? 0} color="bg-green-500" />
            <StatCard icon={FileText} label="À noter" value={data?.pending_grading ?? 0} color="bg-orange-500" />
          </>
        )}
        {user?.role === "admin" && (
          <>
            <StatCard icon={BookOpen} label="Cours" value={data?.total_courses ?? 0} color="bg-blue-500" />
            <StatCard icon={ClipboardList} label="Utilisateurs" value={data?.total_users ?? 0} color="bg-purple-500" />
            <StatCard icon={TrendingUp} label="Inscriptions" value={data?.total_enrollments ?? 0} color="bg-green-500" />
          </>
        )}
      </div>
    </div>
  );
}
