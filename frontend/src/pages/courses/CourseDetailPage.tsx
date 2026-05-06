import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { Course } from "@/types";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["course", id],
    queryFn: () => api.get(`/courses/${id}/`).then((r) => r.data),
  });

  if (isLoading) return <div className="animate-pulse bg-white rounded-xl h-96" />;
  if (!course) return <p className="text-center text-gray-500">Cours introuvable</p>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
      <p className="text-gray-500 mb-6">Enseignant : {course.teacher_name}</p>
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Description</h2>
        <p className="text-gray-600 leading-relaxed">{course.description}</p>
      </div>
    </div>
  );
}
