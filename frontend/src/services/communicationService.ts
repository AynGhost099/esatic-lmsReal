import api from "./api";
import type { Notification, PaginatedResponse } from "@/types";

export interface Forum {
  id: number;
  title: string;
  description: string;
  course: number;
  is_active: boolean;
}

export interface Thread {
  id: number;
  forum: number;
  title: string;
  content: string;
  author: number;
  author_name: string;
  is_pinned: boolean;
  is_locked: boolean;
  posts_count: number;
  created_at: string;
}

export interface Post {
  id: number;
  thread: number;
  content: string;
  author: number;
  author_name: string;
  parent: number | null;
  created_at: string;
  updated_at: string;
}

export const communicationService = {
  forums: () =>
    api.get<PaginatedResponse<Forum>>("/communication/forums/").then((r) => r.data),
  threads: (forumId: number) =>
    api.get<PaginatedResponse<Thread>>(`/communication/forums/${forumId}/threads/`).then((r) => r.data),
  createThread: (forumId: number, data: { title: string; content: string }) =>
    api.post<Thread>(`/communication/forums/${forumId}/threads/`, data).then((r) => r.data),
  posts: (threadId: number) =>
    api.get<PaginatedResponse<Post>>(`/communication/threads/${threadId}/posts/`).then((r) => r.data),
  createPost: (threadId: number, data: { content: string; parent?: number }) =>
    api.post<Post>(`/communication/threads/${threadId}/posts/`, data).then((r) => r.data),
  notifications: () =>
    api.get<PaginatedResponse<Notification>>("/communication/notifications/").then((r) => r.data),
  markRead: (id: number) =>
    api.patch(`/communication/notifications/${id}/read/`).then((r) => r.data),
};
