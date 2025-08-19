import { AlertTriangle, Car, HelpCircle, Home, Shield, Users, Volume2 } from "lucide-react-native";

// Function to get icon based on complaint type
export const ComplaintIcon = (incidentType: string) => {
  const type = (incidentType || "").toLowerCase();

  if (
    type.includes("property") ||
    type.includes("damage") ||
    type.includes("vandalism")
  ) {
    return { icon: Home, color: "#DC2626" };
  }
  if (
    type.includes("theft") ||
    type.includes("robbery") ||
    type.includes("stealing")
  ) {
    return { icon: Shield, color: "#7C2D12" }; // Brown for theft
  }
  if (
    type.includes("noise") ||
    type.includes("disturbance") ||
    type.includes("loud")
  ) {
    return { icon: Volume2, color: "#CA8A04" }; // Yellow for noise
  }
  if (
    type.includes("traffic") ||
    type.includes("parking") ||
    type.includes("vehicle")
  ) {
    return { icon: Car, color: "#1D4ED8" }; // Blue for traffic
  }
  if (
    type.includes("assault") ||
    type.includes("fight") ||
    type.includes("violence")
  ) {
    return { icon: AlertTriangle, color: "#DC2626" }; // Red for violence
  }
  if (
    type.includes("harassment") ||
    type.includes("bullying") ||
    type.includes("intimidation")
  ) {
    return { icon: Users, color: "#9333EA" }; // Purple for harassment
  }

  return { icon: HelpCircle, color: "#6B7280" }; // Gray for unknown
};