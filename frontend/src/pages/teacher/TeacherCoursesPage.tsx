import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Edit2, Trash2, Users, Eye } from "lucide-react";
import { courseService } from "@/services/courseService";
import type { Course, PaginatedResponse } from "@/types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";

const STATUS_COLORS: Record<string, "blue" | "orange" | "gray"> = {
  published: "blue", draft: "orange", archived: "gray",
};
const STATUS_LABELS: Record<string, string> = {
  published: "Publié", draft: "Brouillon", archived: "Archivé",
};

export default function TeacherCoursesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<Course | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Course>>({
    queryKey: ["teacher-courses"],
    queryFn: () => courseService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => courseService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["teacher-courses"] }); setToDelete(null); },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => courseService.update(id, { status } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher-courses"] }),
  });

  if (isLoading) return <Spinner />;
  const courses = data?.results ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes cours</h1>
          <p className="text-sm text-gray-500 mt-1">{courses.length} cours</p>
        </div>
        <Button onClick={() => navigate("/teacher/courses/new")}>
          <Plus size={16} className="mr-2" /> Créer un cours
        </Button>
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="Aucun cours"
          description="Créez votre premier cours pour commencer à enseigner."
          action={<Button onClick={() => navigate("/teacher/courses/new")}><Plus size={14} className="mr-1" /> Créer</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-esatic-blue to-blue-400 flex items-center justify-center">
                  <BookOpen size={40} className="text-white/60" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant={STATUS_COLORS[course.status] ?? "gray"}>{STATUS_LABELS[course.status] ?? course.status}</Badge>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Users size={12} /> {course.enrolled_count}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{course.short_description || course.description}</p>

                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1"
                    onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}>
                    <Edit2 size={13} className="mr-1" /> Modifier
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/courses/${course.id}`)}>
                    <Eye size={13} />
                  </Button>
                  {course.status === "draft" ? (
                    <Button size="sm" className="flex-1"
                      onClick={() => publishMutation.mutate({ id: course.id, status: "published" })}>
                      Publier
                    </Button>
                  ) : (
                    <button onClick={() => setToDelete(course)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title="Supprimer le cours" size="sm">
        {toDelete && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Supprimer <strong>{toDelete.title}</strong> ? Cette action est irréversible.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setToDelete(null)}>Annuler</Button>
              <Button variant="danger" className="flex-1" loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(toDelete.id)}>
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
