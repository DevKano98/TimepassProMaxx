import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardShell } from './components/layout/DashboardShell';
import { FieldShell } from './components/layout/FieldShell';
import { CommandCenterPage } from './pages/dashboard/CommandCenterPage';
import { IncidentsPage } from './pages/dashboard/IncidentsPage';
import { IncidentDetailPage } from './pages/dashboard/IncidentDetailPage';
import { TeamsPage } from './pages/dashboard/TeamsPage';
import { UsersPage } from './pages/dashboard/UsersPage';
import { AlertsPage } from './pages/dashboard/AlertsPage';
import { PredictionsPage } from './pages/dashboard/PredictionsPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { FieldAssignmentsPage } from './pages/field/FieldAssignmentsPage';
import { UserRole } from './types';

// Route Guard: Ensures user is authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-muted">
        <span className="font-mono text-[14px]">Verifying credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/governmentdashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Route Guard: Role-based authorization
const RoleRoute: React.FC<{ allowedRoles: UserRole[]; children: React.ReactNode }> = ({
  allowedRoles,
  children,
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    if (user?.role === 'field_team') {
      return <Navigate to="/governmentdashboard/field" replace />;
    }
    return <Navigate to="/governmentdashboard/home" replace />;
  }

  return <>{children}</>;
};

// Login Route Guard: If already logged in, route automatically
const LoginRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated && user) {
    if (user.role === 'field_team') {
      return <Navigate to="/governmentdashboard/field" replace />;
    }
    return <Navigate to="/governmentdashboard/home" replace />;
  }

  return <LoginPage />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Zone */}
          <Route path="/" element={<LandingPage />} />

          {/* Government Login */}
          <Route path="/governmentdashboard" element={<LoginRoute />} />

          {/* Field Team Zone (Deliberately different mobile-first shell) */}
          <Route
            path="/governmentdashboard/field"
            element={
              <ProtectedRoute>
                <FieldShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<FieldAssignmentsPage />} />
          </Route>

          {/* Post-Login Command Center Dashboard Zone */}
          <Route
            path="/governmentdashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin', 'control_room', 'department_officer']}>
                  <DashboardShell />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="home" element={<CommandCenterPage />} />
            <Route path="incidents" element={<IncidentsPage />} />
            <Route path="incidents/:id" element={<IncidentDetailPage />} />
            <Route
              path="teams"
              element={
                <RoleRoute allowedRoles={['admin', 'control_room']}>
                  <TeamsPage />
                </RoleRoute>
              }
            />
            <Route
              path="users"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <UsersPage />
                </RoleRoute>
              }
            />
            <Route path="alerts" element={<AlertsPage />} />
            <Route
              path="predictions"
              element={
                <RoleRoute allowedRoles={['admin', 'control_room']}>
                  <PredictionsPage />
                </RoleRoute>
              }
            />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Catch-all redirect to public landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
