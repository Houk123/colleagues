import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PortalsPage from "@/pages/PortalsPage";
import PortalPage from "@/pages/PortalPage";
import OrganizationPage from "@/pages/OrganizationPage";
import ProjectPage from "@/pages/ProjectPage";
import TaskPage from "@/pages/TaskPage";
import JoinPortalPage from "@/pages/JoinPortalPage";
import PortalRequestsPage from "@/pages/PortalRequestsPage";
import PortalSettingsPage from "@/pages/PortalSettingsPage";
import AcceptInvitePage from "@/pages/AcceptInvitePage";
import HomePage from "@/pages/HomePage";
import SolutionPage from "@/pages/SolutionPage";
import AuthGuard from "@/features/auth/ui/AuthGuard";
import { AppHeader } from "@/widgets/AppHeader";

function AppRoutes() {
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname.startsWith("/solutions/");

  return (
    <Box minH="100vh" bg="gray.50">
      <AppHeader />
      <Box maxW={isHome ? undefined : "1200px"} mx={isHome ? undefined : "auto"}>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/invites/:token/accept" element={<AcceptInvitePage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/solutions/:slug" element={<SolutionPage />} />
            <Route
              path="/portals"
              element={
                <AuthGuard>
                  <PortalsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/portals/:portalSlug"
              element={
                <AuthGuard>
                  <PortalPage />
                </AuthGuard>
              }
            />
            <Route
              path="/portals/:portalSlug/settings"
              element={
                <AuthGuard>
                  <PortalSettingsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/portals/:portalSlug/organizations/:orgSlug"
              element={
                <AuthGuard>
                  <OrganizationPage />
                </AuthGuard>
              }
            />
            <Route
              path="/portals/:portalSlug/organizations/:orgSlug/projects/:projectSlug"
              element={
                <AuthGuard>
                  <ProjectPage />
                </AuthGuard>
              }
            />
            <Route
              path="/portals/:portalSlug/organizations/:orgSlug/projects/:projectSlug/tasks/:taskId"
              element={
                <AuthGuard>
                  <TaskPage />
                </AuthGuard>
              }
            />
            <Route
              path="/join-portal"
              element={
                <AuthGuard>
                  <JoinPortalPage />
                </AuthGuard>
              }
            />
            <Route
              path="/portal-requests"
              element={
                <AuthGuard>
                  <PortalRequestsPage />
                </AuthGuard>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    );
  }

  function App() {
    return (
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    );
  }

  export default App;
