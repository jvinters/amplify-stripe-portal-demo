import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { getCurrentUser } from "aws-amplify/auth";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SubscriptionsPage } from "@/pages/SubscriptionsPage";
import { Layout } from "@/components/layout/Layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthenticator();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RedirectToRoot() {
  return <Navigate to="/" replace />;
}

function AppRoutes({ showLoginForm }: { showLoginForm: boolean }) {
  const { user } = useAuthenticator();
  const location = useLocation();

  // If not authenticated and trying to access protected routes, redirect to root
  if (!user && location.pathname !== "/") {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : showLoginForm ? (
            // Authenticator will show its form
            <div />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <Layout>
              <SubscriptionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<RedirectToRoot />} />
    </Routes>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {isAuthenticated || showLoginForm ? (
        <Authenticator className="h-dvh flex items-center justify-center"
          components={{
          }}
        >
          <AppRoutes showLoginForm={showLoginForm} />
        </Authenticator>
      ) : (
        <Routes>
          <Route
            path="/"
            element={<LoginPage onSignInClick={() => setShowLoginForm(true)} />}
          />
          <Route path="*" element={<RedirectToRoot />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
