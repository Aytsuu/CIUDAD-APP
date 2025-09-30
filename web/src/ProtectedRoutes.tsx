import { useAuth } from "./context/AuthContext";
import { Navigate, useLocation } from "react-router";
import React from "react";

interface ProtectedRouteProps {
  requiredFeature?: string;
  staffType?: string;
  exclude?: string[]
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  requiredFeature,
  staffType,
  exclude = [],
  children,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if ((!requiredFeature && isAuthenticated && staffType && staffType?.toLowerCase() != user?.staff?.staff_type.toLowerCase()) ||
    exclude.includes(user?.staff?.pos)
  ) {
    return <Navigate to="/page_not_found" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/home" state={{ from: location }} replace />;
  }
  
  const hasAccess = user?.staff?.assignments?.includes(requiredFeature) || 
                    user?.staff?.pos.toLowerCase() == "admin" || 
                    (!requiredFeature && isAuthenticated && user?.staff?.assignments?.length > 0)
  
  if (!hasAccess) {
    console.warn(
      `Position access denied Required: ${requiredFeature}, User has: ${user?.staff?.pos.pos_title}`
    );
    return <Navigate to="/page_not_found" replace />;
  }

  return <>{children}</>;
};
