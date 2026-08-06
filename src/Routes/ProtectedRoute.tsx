import type { ReactNode } from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: string;
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  if (allowedRole !== allowedRole) {
    return <Navigate to={`/dashboard/`} replace />;
  }
  return <>{children}</>;
}
