import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Clock, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/services/api";
import type { Quiz, PaginatedResponse } from "@/types";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";

export default function QuizzesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery<PaginatedResponse<Quiz>>({
    queryKey: ["quizzes"],
    queryFn: () => api.get("/quizzes/").then((r) => r.data),
  });

  if (isLoading) return <Spinner />;

  const quizzes = data?.results ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quiz & Examens</h1>
        <span className="text-sm text-gray-500">{quizzes.length} quiz</span>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucun quiz disponible"
          description="Les quiz publiés par vos enseignants apparaîtront ici."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ClipboardList size={20} className="text-esatic-blue" />
                </div>
                <span className="text-xs bg-blue-50 text-esatic-blue px-2 py-1 rounded-full font-medium">
                  {quiz.pass_score}% pour réussir
                </span>
              </div>

              <h3 className="font-semibold text-gray-800 mb-1">{quiz.title}</h3>
              {quiz.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{quiz.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-400 mt-auto mb-4">
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} />
                  {quiz.questions_count} question{quiz.questions_count !== 1 ? "s" : ""}
                </span>
                {quiz.time_limit_minutes ? (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {quiz.time_limit_minutes} min
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-500">
                    <AlertCircle size={14} />
                    Sans limite
                  </span>
                )}
              </div>

              <Button className="w-full" onClick={() => navigate(`/quizzes/${quiz.id}`)}>
                Commencer le quiz
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
