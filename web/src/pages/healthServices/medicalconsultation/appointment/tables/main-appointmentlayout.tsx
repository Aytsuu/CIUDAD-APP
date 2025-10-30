// AppointmentsLayout.tsx
import { Outlet } from "react-router-dom";
import { ProtectedComponent } from "@/ProtectedComponent";

export default function AppointmentsLayout() {
  return (
    <ProtectedComponent exclude={["DOCTOR"]}>
      <div className="space-y-6">
        <Outlet />
      </div>
    </ProtectedComponent>
  );
}