import BhwMidwifeReports from "./Mainbhw-midwife-report";
import DoctorReports from "./Maindoctor-report";
import { useAuth } from "@/context/AuthContext";

export default function HealthcareReports() {
  const { user } = useAuth();

  if (!user) return null;

  const userPosition = user?.staff?.pos;
  const userPositionTitle = typeof userPosition === "string"
    ? userPosition
    : userPosition?.pos_title || "";

  return (
    <>
      {userPositionTitle.toLowerCase().includes("doctor") ? (
        <DoctorReports />
      ) : (
        <BhwMidwifeReports />
      )}
    </>
  );
}


