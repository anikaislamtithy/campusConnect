import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ServerContextProvider } from "./hooks/useServerContext";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import NotificationToast from "./components/Notifications/NotificationToast";

// Auth Components
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import VerifyEmail from "./components/Auth/VerifyEmail";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import ResourceView from "./pages/ResourceView";
import Courses from "./pages/Courses";
import StudyGroups from "./pages/StudyGroups";
import StudyGroupDetails from "./pages/StudyGroupDetails";
import ResourceRequests from "./pages/ResourceRequests";
import RequestDetails from "./pages/RequestDetails";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Achievements from "./pages/Achievements";
import Bookmarks from "./pages/Bookmarks";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminResources from "./pages/admin/AdminResources";
import AdminStudyGroups from "./pages/admin/AdminStudyGroups";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminAchievements from "./pages/admin/AdminAchievements";

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Navigate to="/dashboard" replace />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            {user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />}
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/resources" element={
        <ProtectedRoute>
          <Layout>
            <Resources />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/resources/:id" element={
        <ProtectedRoute>
          <Layout>
            <ResourceView />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/courses" element={
        <ProtectedRoute>
          <Layout>
            <Courses />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/study-groups" element={
        <ProtectedRoute>
          <Layout>
            <StudyGroups />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/study-groups/:id" element={
        <ProtectedRoute>
          <Layout>
            <StudyGroupDetails />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/requests" element={
        <ProtectedRoute>
          <Layout>
            <ResourceRequests />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/requests/:id" element={
        <ProtectedRoute>
          <Layout>
            <RequestDetails />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute>
          <Layout>
            <Users />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile/:userId" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <Layout>
            <Notifications />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/achievements" element={
        <ProtectedRoute>
          <Layout>
            <Achievements />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/bookmarks" element={
        <ProtectedRoute>
          <Layout>
            <Bookmarks />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/users" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <AdminUsers />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/courses" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <AdminCourses />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/resources" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <AdminResources />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/study-groups" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <AdminStudyGroups />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/requests" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <AdminRequests />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/achievements" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <AdminAchievements />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ServerContextProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <NotificationToast />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ServerContextProvider>
    </AuthProvider>
  );
}

export default App;