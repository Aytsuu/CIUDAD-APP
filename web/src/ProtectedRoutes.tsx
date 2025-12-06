import { useAuth } from "./context/AuthContext";
import { Navigate, useLocation } from "react-router";
import React from "react";

interface ProtectedRouteProps {
  requiredFeatures?: string[];
  staffType?: string;
  exclude?: string[]
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({
  requiredFeatures = [],
  staffType,
  exclude = [],
  children,
  adminOnly = false
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

  if (adminOnly && user?.staff?.pos.toLowerCase() !== "admin") {
    return <Navigate to="/page_not_found" replace />;
  }

  if ((requiredFeatures.length != 0 && isAuthenticated && staffType && staffType?.toLowerCase() != user?.staff?.staff_type.toLowerCase()) ||
    exclude.includes(user?.staff?.pos)
  ) {
    return <Navigate to="/page_not_found" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  const hasAccess = requiredFeatures.every((feat) => user?.staff?.assignments?.includes(feat)) || 
                    (user?.staff?.pos.toLowerCase() == "admin" && !exclude.includes("ADMIN")) || 
                    (requiredFeatures.length != 0 && isAuthenticated && user?.staff?.assignments?.length > 0)
  
  if (!hasAccess) {
    return <Navigate to="/page_not_found" replace />;
  }

  return <>{children}</>;
};