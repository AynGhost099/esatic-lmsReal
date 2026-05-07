import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from "lucide-react";
import { courseService, type Section } from "@/services/courseService";
import type { Course } from "@/types";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

const courseSchema = z.object({
  title: z.string().min(3, "Minimum 3 caractères"),
  slug: z.string().min(3, "Minimum 3 caractères"),
  description: z.string().min(10, "Minimum 10 caractères"),
  short_description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  category: z.number({ coerce: true }).optional(),
});
type CourseForm = z.infer<typeof courseSchema>;

export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id || id === "new";
  const courseId = isNew ? null : Number(id);

  const [sections, setSections] = useState<Partial<Section>[]>([]);
  const [newSection, setNewSection] = useState("");

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: () => courseService.detail(courseId!),
    enabled: !isNew,
  });

  const { data: existingSections } = useQuery<Section[]>({
    queryKey: ["sections", courseId],
    queryFn: () => courseService.sections(courseId!),
    enabled: !isNew,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => courseService.categories(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: { status: "draft" },
  });

  useEffect(() => {
    if (course) reset({ ...course, category: course.category as any });
  }, [course]);

  useEffect(() => {
    if (existingSections) setSections(existingSections);
  }, [existingSections]);

  const saveMutation = useMutation({
    mutationFn: (data: CourseForm) =>
      isNew ? courseService.create(data as any) : courseService.update(courseId!, data as any),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      if (isNew) navigate(`/teacher/courses/${saved.id}/edit`, { replace: true });
    },
  });

  const addSectionMutation = useMutation({
    mutationFn: () => courseService.createSection(courseId!, { title: newSection, order: sections.length + 1 }),
    onSuccess: (s) => {
      setSections((prev) => [...prev, s]);
      setNewSection("");
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
    },
  });

  if (!isNew && isLoading) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate("/teacher/courses")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-esatic-blue mb-6 transition">
        <ArrowLeft size={16} /> Mes cours
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isNew ? "Créer un cours" : "Modifier le cours"}
      </h1>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-700">Informations générales</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input {...register("title")} placeholder="Introduction à Python"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
            <input {...register("slug")} placeholder="introduction-python"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue" />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select {...register("category")}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue bg-white">
                <option value="">— Sélectionner —</option>
                {categories?.results.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select {...register("status")}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue bg-white">
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description courte</label>
            <input {...register("short_description")} placeholder="Résumé en une phrase"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description complète *</label>
            <textarea {...register("description")} rows={5}
              placeholder="Décrivez le contenu, les objectifs, les prérequis..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue resize-none" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
        </div>

        {/* Sections — only after course is created */}
        {!isNew && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Sections du cours</h2>
            <div className="space-y-2 mb-4">
              {sections.map((s, i) => (
                <div key={s.id ?? i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                  <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700">{s.title}</span>
                  <span className="text-xs text-gray-400">#{i + 1}</span>
                </div>
              ))}
              {sections.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Aucune section</p>}
            </div>
            <div className="flex gap-2">
              <input value={newSection} onChange={(e) => setNewSection(e.target.value)}
                placeholder="Titre de la nouvelle section"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newSection.trim()) addSectionMutation.mutate(); } }}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue" />
              <Button type="button" size="sm" loading={addSectionMutation.isPending}
                disabled={!newSection.trim()} onClick={() => addSectionMutation.mutate()}>
                <Plus size={14} className="mr-1" /> Ajouter
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate("/teacher/courses")}>
            Annuler
          </Button>
          <Button type="submit" loading={saveMutation.isPending}>
            <Save size={14} className="mr-2" /> {isNew ? "Créer le cours" : "Sauvegarder"}
          </Button>
        </div>
      </form>
    </div>
  );
}
