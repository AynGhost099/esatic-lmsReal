import api from "./api";
import type { Quiz, PaginatedResponse } from "@/types";

export interface QuizQuestion {
  id: number;
  text: string;
  question_type: "mcq" | "true_false" | "short";
  points: number;
  choices: { id: number; text: string }[];
}

export interface QuizDetail extends Quiz {
  questions: QuizQuestion[];
}

export const quizService = {
  list: () => api.get<PaginatedResponse<Quiz>>("/quizzes/").then((r) => r.data),
  detail: (id: number) => api.get<QuizDetail>(`/quizzes/${id}/`).then((r) => r.data),
  startAttempt: (quizId: number) =>
    api.post(`/quizzes/${quizId}/attempt/`).then((r) => r.data),
  submit: (quizId: number, answers: { question_id: number; selected_choices: number[] }[]) =>
    api.put(`/quizzes/${quizId}/submit/`, { answers }).then((r) => r.data),
};
