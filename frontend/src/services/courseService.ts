import api from "./api";
import type { Course, PaginatedResponse } from "@/types";

export interface Section {
  id: number;
  title: string;
  order: number;
  description: string;
  course: number;
}

export interface Resource {
  id: number;
  title: string;
  resource_type: "file" | "video" | "link" | "text";
  description: string;
  file: string | null;
  url: string;
  content: string;
  order: number;
  section: number;
}

export interface Enrollment {
  id: number;
  student: number;
  course: number;
  status: "active" | "completed" | "dropped";
  progress: number;
  enrolled_at: string;
  is_active: boolean;
}

export const courseService = {
  list: (params?: { status?: string; search?: string }) =>
    api.get<PaginatedResponse<Course>>("/courses/", { params }).then((r) => r.data),
  detail: (id: number) =>
    api.get<Course>(`/courses/${id}/`).then((r) => r.data),
  create: (data: Partial<Course>) =>
    api.post<Course>("/courses/", data).then((r) => r.data),
  update: (id: number, data: Partial<Course>) =>
    api.patch<Course>(`/courses/${id}/`, data).then((r) => r.data),
  delete: (id: number) =>
    api.delete(`/courses/${id}/`).then((r) => r.data),
  enroll: (courseId: number) =>
    api.post<Enrollment>(`/courses/${courseId}/enroll/`).then((r) => r.data),
  unenroll: (courseId: number) =>
    api.delete(`/courses/${courseId}/unenroll/`).then((r) => r.data),
  sections: (courseId: number) =>
    api.get<Section[]>(`/courses/${courseId}/sections/`).then((r) => r.data),
  createSection: (courseId: number, data: { title: string; order: number; description?: string }) =>
    api.post<Section>(`/courses/${courseId}/sections/`, data).then((r) => r.data),
  resources: (sectionId: number) =>
    api.get<PaginatedResponse<Resource>>(`/resources/?section=${sectionId}`).then((r) => r.data),
  uploadResource: (formData: FormData) =>
    api.post<Resource>("/resources/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
  categories: () =>
    api.get<PaginatedResponse<{ id: number; name: string; slug: string }>>("/courses/categories/").then((r) => r.data),
};
