import api from "./api";
import type { Assignment, PaginatedResponse } from "@/types";

export interface Grade {
  id: number;
  score: number;
  feedback: string;
  graded_at: string;
}

export interface Submission {
  id: number;
  assignment: number;
  student: number;
  status: "draft" | "submitted" | "graded" | "returned";
  content: string;
  file: string | null;
  submitted_at: string | null;
  is_late: boolean;
  grade: Grade | null;
}

export const assignmentService = {
  list: () => api.get<PaginatedResponse<Assignment>>("/assignments/").then((r) => r.data),
  detail: (id: number) => api.get<Assignment>(`/assignments/${id}/`).then((r) => r.data),
  mySubmission: (id: number) =>
    api.get<Submission>(`/assignments/${id}/my_submission/`).then((r) => r.data),
  submit: (id: number, formData: FormData) =>
    api.post<Submission>(`/assignments/${id}/submit/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
  listSubmissions: (id: number) =>
    api.get<PaginatedResponse<Submission>>(`/assignments/${id}/submissions/`).then((r) => r.data),
  grade: (submissionId: number, score: number, feedback: string) =>
    api.post(`/assignments/submissions/${submissionId}/grade/`, { score, feedback }).then((r) => r.data),
};
