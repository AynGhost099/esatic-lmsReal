import api from "./api";
import type { User, Course, PaginatedResponse } from "@/types";

export const adminService = {
  listUsers: (params?: { role?: string; search?: string; page?: number }) =>
    api.get<PaginatedResponse<User>>("/accounts/users/", { params }).then((r) => r.data),
  createUser: (data: Partial<User> & { password: string }) =>
    api.post<User>("/accounts/users/", data).then((r) => r.data),
  updateUser: (id: number, data: Partial<User>) =>
    api.patch<User>(`/accounts/users/${id}/`, data).then((r) => r.data),
  deleteUser: (id: number) =>
    api.delete(`/accounts/users/${id}/`).then((r) => r.data),
  listCourses: (params?: { status?: string; search?: string }) =>
    api.get<PaginatedResponse<Course>>("/courses/", { params }).then((r) => r.data),
  updateCourse: (id: number, data: Partial<Course>) =>
    api.patch<Course>(`/courses/${id}/`, data).then((r) => r.data),
  deleteCourse: (id: number) =>
    api.delete(`/courses/${id}/`).then((r) => r.data),
};
