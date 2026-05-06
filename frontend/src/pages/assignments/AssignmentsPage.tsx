import { useQuery } from "@tanstack/react-query";
import { FileText, Calendar } from "lucide-react";
import { format, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import api from "@/services/api";
import type { Assignment, PaginatedResponse } from "@/types";

export default function AssignmentsPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Assignment>>({
    queryKey: ["assignments"],
    queryFn: () => api.get("/assignments/").then((r) => r.data),
  });

  if (isLoading) return <div className="animate-pulse bg-white rounded-xl h-64" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Devoirs</h1>
      <div className="space-y-4">
        {data?.results.map((assignment) => {
          const deadline = new Date(assignment.deadline);
          const overdue = isPast(deadline);
          return (
            <div key={assignment.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${overdue ? "bg-red-50" : "bg-blue-50"}`}>
                    <FileText size={20} className={overdue ? "text-red-500" : "text-blue-500"} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">{assignment.max_score} pts</span>
              </div>
              <div className={`flex items-center gap-1 mt-3 text-sm ${overdue ? "text-red-500" : "text-gray-400"}`}>
                <Calendar size={14} />
                <span>
                  {overdue ? "Expiré le " : "Deadline : "}
                  {format(deadline, "dd MMM yyyy à HH:mm", { locale: fr })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
