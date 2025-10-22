import { useAuth } from "./context/AuthContext";
import React from "react";

interface ProtectedComponentProps {
  exclude?: string[];
  children: React.ReactNode;
}

export const ProtectedComponentButton = ({
  exclude = [],
  children,
}: ProtectedComponentProps) => {
  const { user } = useAuth();

  if (!user) return null;

  const userPosition = user?.staff?.pos;
  const userPositionTitle = typeof userPosition === 'string' 
    ? userPosition 
    : userPosition?.pos_title || '';

  // Hide if user's position is in the exclude list
  if (exclude.some(excludedPos => 
    userPositionTitle.toLowerCase().includes(excludedPos.toLowerCase())
  )) {
    return null;
  }

  return <>{children}</>;
};