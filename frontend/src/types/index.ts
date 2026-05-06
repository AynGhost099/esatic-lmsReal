export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar: string | null;
  bio: string;
  is_verified: boolean;
  date_joined: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  thumbnail: string | null;
  category: number;
  teacher: number;
  teacher_name: string;
  status: "draft" | "published" | "archived";
  enrolled_count: number;
  created_at: string;
}

export interface Section {
  id: number;
  title: string;
  order: number;
  description: string;
  course: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit_minutes: number | null;
  pass_score: number;
  questions_count: number;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  max_score: number;
}

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
