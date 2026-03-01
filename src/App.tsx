import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import UsersPage from "./features/users/pages/UsersPage";
import ProtectedRoute from "./shared/components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/users" replace />} />
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
}
