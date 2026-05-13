import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../api/AuthContext";
import { UserRole } from "../../api/session";
import { Icons } from "../navigation/Icons";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="route-loading">
        <div className="route-loading-panel">
          <Icons.Loading />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.profile.role)) {
    const dest = session.profile.role === "traveller" ? "/traveller" : 
                 session.profile.role === "companion" ? "/companion" : "/";
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
}
