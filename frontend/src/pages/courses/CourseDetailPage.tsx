import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Users, ChevronDown, ChevronRight, FileText, Video, Link as LinkIcon, AlignLeft, CheckCircle, Lock } from "lucide-react";
import { courseService, type Section, type Resource } from "@/services/courseService";
import { useAuthStore } from "@/store/authStore";
import type { Course } from "@/types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

const RESOURCE_ICONS: Record<string, React.ElementType> = { file: FileText, video: Video, link: LinkIcon, text: AlignLeft };
const RESOURCE_COLORS: Record<string, string> = {
  file: "text-blue-500 bg-blue-50", video: "text-red-500 bg-red-50",
  link: "text-green-500 bg-green-50", text: "text-purple-500 bg-purple-50",
};

function SectionItem({ section, isEnrolled }: { section: Section; isEnrolled: boolean }) {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["resources", section.id],
    queryFn: () => courseService.resources(section.id),
    enabled: open && isEnrolled,
  });

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition text-left">
        <div className="flex items-center gap-3">
          {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
          <span className="font-medium text-gray-800">{section.title}</span>
        </div>
        {!isEnrolled && <Lock size={14} className="text-gray-400" />}
      </button>
      {open && isEnrolled && (
        <div className="divide-y divide-gray-50">
          {!data && <div className="px-5 py-3"><Spinner size="sm" /></div>}
          {data?.results.length === 0 && <p className="px-5 py-3 text-sm text-gray-400">Aucune ressource.</p>}
          {data?.results.map((r: Resource) => {
            const Icon = RESOURCE_ICONS[r.resource_type] ?? FileText;
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                <div className={`p-2 rounded-lg ${RESOURCE_COLORS[r.resource_type] ?? "text-gray-500 bg-gray-50"}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                  {r.description && <p className="text-xs text-gray-400 truncate">{r.description}</p>}
                </div>
                {r.file && <a href={r.file} target="_blank" rel="noreferrer" className="text-xs text-esatic-blue hover:underline">Télécharger</a>}
                {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-esatic-blue hover:underline">Ouvrir</a>}
              </div>
            );
          })}
        </div>
      )}
      {open && !isEnrolled && <p className="px-5 py-3 text-sm text-gray-400">Inscrivez-vous pour accéder au contenu.</p>}
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const courseId = Number(id);

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: () => courseService.detail(courseId),
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: ["sections", courseId],
    queryFn: () => courseService.sections(courseId),
    enabled: !!course,
  });

  const enrollMutation = useMutation({
    mutationFn: () => courseService.enroll(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course", courseId] }),
  });

  const unenrollMutation = useMutation({
    mutationFn: () => courseService.unenroll(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course", courseId] }),
  });

  if (isLoading) return <Spinner />;
  if (!course) return <p className="text-center text-gray-500">Cours introuvable</p>;

  const isEnrolled = (course as any).is_enrolled ?? false;
  const isOwner = user?.role === "teacher" && (course as any).teacher === user.id;
  const canEdit = isOwner || user?.role === "admin";

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />}
        <div className="p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Badge variant={course.status === "published" ? "blue" : "orange"} className="mb-2">
                {course.status === "published" ? "Publié" : course.status === "draft" ? "Brouillon" : "Archivé"}
              </Badge>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h1>
              {course.short_description && <p className="text-gray-500 mb-4">{course.short_description}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><BookOpen size={14} /> <strong className="text-gray-600">{course.teacher_name}</strong></span>
                <span className="flex items-center gap-1"><Users size={14} /> {course.enrolled_count} inscrits</span>
              </div>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              {canEdit && (
                <Button variant="secondary" size="sm" onClick={() => navigate(`/teacher/courses/${courseId}/edit`)}>
                  Modifier
                </Button>
              )}
              {user?.role === "student" && (
                isEnrolled ? (
                  <Button variant="secondary" onClick={() => unenrollMutation.mutate()} loading={unenrollMutation.isPending}>
                    Se désinscrire
                  </Button>
                ) : (
                  <Button onClick={() => enrollMutation.mutate()} loading={enrollMutation.isPending}>
                    S'inscrire
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contenu ({sections?.length ?? 0} sections)</h2>
            {sectionsLoading ? <Spinner size="sm" /> : (
              <div className="space-y-2">
                {sections?.map((s) => (
                  <SectionItem key={s.id} section={s} isEnrolled={isEnrolled || canEdit} />
                ))}
                {sections?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Aucune section.</p>}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {isEnrolled && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" /> Ma progression
              </h3>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                <div className="bg-esatic-blue h-2 rounded-full" style={{ width: `${(course as any).progress ?? 0}%` }} />
              </div>
              <p className="text-xs text-gray-400 text-right">{(course as any).progress ?? 0}%</p>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 text-sm">
            <h3 className="font-semibold text-gray-700">Informations</h3>
            <div className="flex justify-between text-gray-500"><span>Sections</span><span className="font-medium text-gray-700">{sections?.length ?? 0}</span></div>
            <div className="flex justify-between text-gray-500"><span>Inscrits</span><span className="font-medium text-gray-700">{course.enrolled_count}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
