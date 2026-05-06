import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Clock } from "lucide-react";
import api from "@/services/api";
import type { Quiz, PaginatedResponse } from "@/types";

export default function QuizzesPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Quiz>>({
    queryKey: ["quizzes"],
    queryFn: () => api.get("/quizzes/").then((r) => r.data),
  });

  if (isLoading) return <div className="animate-pulse bg-white rounded-xl h-64" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quiz & Examens</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.results.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{quiz.questions_count} questions</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                {quiz.pass_score}% pour réussir
              </span>
            </div>
            {quiz.time_limit_minutes && (
              <div className="flex items-center gap-1 mt-3 text-sm text-gray-400">
                <Clock size={14} />
                <span>{quiz.time_limit_minutes} min</span>
              </div>
            )}
            <button className="mt-4 w-full bg-esatic-blue text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition">
              Commencer le quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
