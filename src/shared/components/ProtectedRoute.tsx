import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "@/shared/stores/authStore";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthed = authStore((auth) => auth.getIsAuthenticated());
  const location = useLocation();
  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
