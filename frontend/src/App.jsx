import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Layout } from "@/components/layout/Layout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Login } from "@/pages/Login";
import { UsersManagement } from "@/pages/admin/UsersManagement";
import { AdminSettings } from "@/pages/admin/AdminSettings";
import { DashboardList } from "@/pages/dashboards/DashboardList";
import { DashboardView } from "@/pages/dashboards/DashboardView";
import { WikiLayout } from "@/pages/wiki/WikiLayout";
import { WikiPage } from "@/pages/wiki/WikiPage";
import { WikiEditor } from "@/pages/wiki/WikiEditor";
import { WikiVersions } from "@/pages/wiki/WikiVersions";
import { PortfolioList } from "@/pages/portfolio/PortfolioList";
import { PortfolioView } from "@/pages/portfolio/PortfolioView";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/dashboards" replace />;
  return children;
}

function SmartRoot() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  return user ? <Layout /> : <PublicLayout />;
}

function SmartIndex() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboards" replace />;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8 text-muted-foreground">
      <p className="text-lg">Bienvenue — connectez-vous ou parcourez les contenus publics.</p>
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <SmartRoot />,
    children: [
      { index: true, element: <SmartIndex /> },
      {
        path: "dashboards",
        handle: { title: "Dashboards" },
        element: <RequireAuth><Outlet /></RequireAuth>,
        children: [
          { index: true, element: <DashboardList /> },
          { path: ":slug", element: <DashboardView />, handle: { title: "Dashboard" } },
        ],
      },
      {
        path: "wiki",
        handle: { title: "Wiki" },
        element: <WikiLayout />,
        children: [
          { index: true, element: <WikiPage /> },
          {
            path: "new",
            element: <RequireAuth><WikiEditor /></RequireAuth>,
            handle: { title: "Nouvelle page" },
          },
          { path: ":slug", element: <WikiPage /> },
          {
            path: ":slug/edit",
            element: <RequireAuth><WikiEditor /></RequireAuth>,
            handle: { title: "Modifier" },
          },
          {
            path: ":slug/versions",
            element: <RequireAuth><WikiVersions /></RequireAuth>,
            handle: { title: "Historique" },
          },
        ],
      },
      {
        path: "portfolio",
        handle: { title: "Portfolio" },
        children: [
          { index: true, element: <PortfolioList /> },
          { path: ":slug", element: <PortfolioView /> },
        ],
      },
      {
        path: "admin",
        element: (
          <RequireAuth>
            <RequireAdmin>
              <Outlet />
            </RequireAdmin>
          </RequireAuth>
        ),
        children: [
          { path: "users", element: <UsersManagement />, handle: { title: "Utilisateurs" } },
          { path: "settings", element: <AdminSettings />, handle: { title: "Paramètres" } },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
