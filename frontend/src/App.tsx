import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import DashboardPage from '@/pages/dashboard';
import ProfilePage from '@/pages/profile';
import PlaceholderPage from '@/pages/placeholder';
import { Loader2 } from 'lucide-react';

function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <RegisterPage />
              </GuestOnly>
            }
          />

          {/* Protected routes */}
          <Route
            element={
              <AuthGate>
                <Layout />
              </AuthGate>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assets" element={<PlaceholderPage title="Assets" />} />
            <Route path="/assets/new" element={<PlaceholderPage title="New Asset" />} />
            <Route path="/assets/edit/:id" element={<PlaceholderPage title="Edit Asset" />} />
            <Route path="/categories" element={<PlaceholderPage title="Categories" />} />
            <Route path="/departments" element={<PlaceholderPage title="Departments" />} />
            <Route path="/locations" element={<PlaceholderPage title="Locations" />} />
            <Route path="/assignments" element={<PlaceholderPage title="Assignments" />} />
            <Route path="/transfers" element={<PlaceholderPage title="Transfers" />} />
            <Route path="/transfers/pending" element={<PlaceholderPage title="Pending Transfers" />} />
            <Route path="/book-value" element={<PlaceholderPage title="Book Value" />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
