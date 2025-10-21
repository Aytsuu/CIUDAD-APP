// AppointmentsLayout.tsx
import { Outlet } from "react-router-dom";
import { ProtectedComponentButton } from "@/ProtectedComponentButton";

export default function AppointmentsLayout() {
  return (
    <ProtectedComponentButton exclude={["DOCTOR"]}>
      <div className="space-y-6">
        <Outlet />
      </div>
    </ProtectedComponentButton>
  );
}