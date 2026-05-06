import { useQuery } from "@tanstack/react-query";
import { BookOpen, ClipboardList, FileText, TrendingUp, Users } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import Spinner from "@/components/ui/Spinner";

interface DashboardData {
  enrolled_courses?: number;
  completed_courses?: number;
  pending_assignments?: number;
  quiz_attempts?: number;
  total_courses?: number;
  total_students?: number;
  pending_grading?: number;
  total_users?: number;
  total_enrollments?: number;
  activity_by_day?: { date: string; count: number }[];
  enrollments_by_course?: { course: string; count: number }[];
  progress_distribution?: { label: string; value: number }[];
}

const ESATIC_BLUE = "#003087";
const ESATIC_ORANGE = "#FF6B00";
const COLORS = [ESATIC_BLUE, ESATIC_ORANGE, "#10b981", "#8b5cf6", "#f59e0b"];

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

const defaultActivity = [
  { date: "Lun", count: 4 }, { date: "Mar", count: 7 }, { date: "Mer", count: 5 },
  { date: "Jeu", count: 9 }, { date: "Ven", count: 6 }, { date: "Sam", count: 3 },
  { date: "Dim", count: 2 },
];

const defaultProgress = [
  { label: "Terminé", value: 30 },
  { label: "En cours", value: 50 },
  { label: "Non commencé", value: 20 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/reporting/dashboard/").then((r) => r.data),
  });

  if (isLoading) return <Spinner />;

  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";
  const isAdmin = user?.role === "admin";

  const activityData = data?.activity_by_day ?? defaultActivity;
  const progressData = data?.progress_distribution ?? defaultProgress;
  const enrollmentData = data?.enrollments_by_course ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour, {user?.first_name || user?.email} !
        </h1>
        <p className="text-gray-500 mt-1">Voici votre tableau de bord</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isStudent && (
          <>
            <StatCard icon={BookOpen} label="Cours inscrits" value={data?.enrolled_courses ?? 0} color="bg-blue-600" />
            <StatCard icon={TrendingUp} label="Cours terminés" value={data?.completed_courses ?? 0} color="bg-green-500" />
            <StatCard icon={FileText} label="Devoirs en attente" value={data?.pending_assignments ?? 0} color="bg-orange-500" />
            <StatCard icon={ClipboardList} label="Quiz passés" value={data?.quiz_attempts ?? 0} color="bg-purple-500" />
          </>
        )}
        {isTeacher && (
          <>
            <StatCard icon={BookOpen} label="Mes cours" value={data?.total_courses ?? 0} color="bg-blue-600" />
            <StatCard icon={Users} label="Étudiants" value={data?.total_students ?? 0} color="bg-green-500" />
            <StatCard icon={FileText} label="À noter" value={data?.pending_grading ?? 0} color="bg-orange-500" />
            <StatCard icon={TrendingUp} label="Inscriptions" value={data?.total_enrollments ?? 0} color="bg-purple-500" />
          </>
        )}
        {isAdmin && (
          <>
            <StatCard icon={BookOpen} label="Cours" value={data?.total_courses ?? 0} color="bg-blue-600" />
            <StatCard icon={Users} label="Utilisateurs" value={data?.total_users ?? 0} color="bg-purple-500" />
            <StatCard icon={TrendingUp} label="Inscriptions" value={data?.total_enrollments ?? 0} color="bg-green-500" />
            <StatCard icon={FileText} label="En attente" value={data?.pending_grading ?? 0} color="bg-orange-500" />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Activité cette semaine</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ESATIC_BLUE} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={ESATIC_BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #f0f0f0", fontSize: "12px" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Actions"
                stroke={ESATIC_BLUE}
                strokeWidth={2}
                fill="url(#activityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Progress distribution pie */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            {isStudent ? "Progression" : "Répartition"}
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={progressData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                nameKey="label"
              >
                {progressData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #f0f0f0", fontSize: "12px" }}
                formatter={(value) => [`${value}%`, ""]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrollments per course (teacher/admin) */}
      {(isTeacher || isAdmin) && enrollmentData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Inscriptions par cours</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={enrollmentData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="course" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #f0f0f0", fontSize: "12px" }}
              />
              <Bar dataKey="count" name="Étudiants" fill={ESATIC_ORANGE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
