import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import CoursesPage from "@/pages/courses/CoursesPage";
import CourseDetailPage from "@/pages/courses/CourseDetailPage";
import QuizzesPage from "@/pages/quizzes/QuizzesPage";
import QuizPlayerPage from "@/pages/quizzes/QuizPlayerPage";
import AssignmentsPage from "@/pages/assignments/AssignmentsPage";
import ForumsPage from "@/pages/communication/ForumsPage";
import ThreadPage from "@/pages/communication/ThreadPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import AdminPage from "@/pages/admin/AdminPage";
import TeacherCoursesPage from "@/pages/teacher/TeacherCoursesPage";
import CourseEditorPage from "@/pages/teacher/CourseEditorPage";
import GradeSubmissionsPage from "@/pages/teacher/GradeSubmissionsPage";
import Layout from "@/components/layout/Layout";
import type { UserRole } from "@/types";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Cours */}
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />

          {/* Quiz */}
          <Route path="quizzes" element={<QuizzesPage />} />
          <Route path="quizzes/:id" element={<QuizPlayerPage />} />

          {/* Devoirs */}
          <Route path="assignments" element={<AssignmentsPage />} />

          {/* Forums */}
          <Route path="forums" element={<ForumsPage />} />
          <Route path="forums/threads/:id" element={<ThreadPage />} />

          {/* Profil */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Admin */}
          <Route path="admin" element={
            <RoleRoute roles={["admin"]}>
              <AdminPage />
            </RoleRoute>
          } />

          {/* Enseignant */}
          <Route path="teacher/courses" element={
            <RoleRoute roles={["teacher", "admin"]}>
              <TeacherCoursesPage />
            </RoleRoute>
          } />
          <Route path="teacher/courses/:id/edit" element={
            <RoleRoute roles={["teacher", "admin"]}>
              <CourseEditorPage />
            </RoleRoute>
          } />
          <Route path="teacher/courses/new" element={
            <RoleRoute roles={["teacher", "admin"]}>
              <CourseEditorPage />
            </RoleRoute>
          } />
          <Route path="teacher/grades" element={
            <RoleRoute roles={["teacher", "admin"]}>
              <GradeSubmissionsPage />
            </RoleRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import Register from './pages/Register';

// Dans les Routes :
<<Route path="/register" element={<Register />} />
