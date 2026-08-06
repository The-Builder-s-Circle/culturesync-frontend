import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ children, allowedRole }) {
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  // Logged in but wrong role → redirect to their OWN dashboard
  if (allowedRole !== allowedRole) {
    return <Navigate to={`/dashboard/`} replace />;
  }
  // All good — render the layout
  return children;
}
