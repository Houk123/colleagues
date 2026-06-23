import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PortalsPage from "@/pages/PortalsPage";
import PortalPage from "@/pages/PortalPage";
import OrganizationPage from "@/pages/OrganizationPage";
import ProjectPage from "@/pages/ProjectPage";
import JoinPortalPage from "@/pages/JoinPortalPage";
import PortalRequestsPage from "@/pages/PortalRequestsPage";
import AcceptInvitePage from "@/pages/AcceptInvitePage";
import AuthGuard from "@/features/auth/ui/AuthGuard";
import NotificationBell from "@/features/notification/ui/NotificationBell";
import { useAuthStore } from "@/entities/user/model/authStore";

function App() {
  const user = useAuthStore((s) => s.user);
  return (
    <BrowserRouter>
      {user && (
        <Box position="fixed" top="3" right="4" zIndex="1000">
          <NotificationBell />
        </Box>
      )}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/invites/:token/accept" element={<AcceptInvitePage />} />
        <Route
          path="/"
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
    </BrowserRouter>
  );
}

export default App;
