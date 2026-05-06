import { useQuery } from "@tanstack/react-query";
import { BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import type { Course, PaginatedResponse } from "@/types";

export default function CoursesPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Course>>({
    queryKey: ["courses"],
    queryFn: () => api.get("/courses/?status=published").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl h-56 animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mes Cours</h1>
      </div>

      {data?.results.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p>Aucun cours disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.results.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden group"
            >
              <div className="h-40 bg-gradient-to-br from-blue-500 to-esatic-blue flex items-center justify-center">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={48} className="text-white opacity-60" />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 group-hover:text-esatic-blue transition line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{course.teacher_name}</p>
                <div className="flex items-center gap-1 mt-3 text-sm text-gray-400">
                  <Users size={14} />
                  <span>{course.enrolled_count} étudiant(s)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
