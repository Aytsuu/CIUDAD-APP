import { useAuth } from "./context/AuthContext";
import { UserPosition } from "./context/auth-types";
import { Navigate, useLocation } from "react-router";
import React from "react";

interface ProtectedRouteProps {
  requiredPosition: UserPosition;
  children: React.ReactNode;
  alternativePositions?: UserPosition[]; // This is for routes accessible by multiple positions
}

export const ProtectedRoute = ({
  requiredPosition,
  children,
  alternativePositions = [],
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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  //   const hasAccess =
  //     user?.staff?.pos.pos_title === requiredPosition ||
  //     alternativePositions.includes(user?.staff?.pos.pos_title);

  const hasAccess = user?.staff?.assignments?.some(
    (assignment: any) =>
      assignment.pos.pos_title === requiredPosition ||
      alternativePositions.includes(assignment.pos.pos_title)
  );
  
  if (!hasAccess) {
    console.warn(
      `Position access denied Required: ${requiredPosition}, User has: ${user?.staff?.pos.pos_title}`
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
