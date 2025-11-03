// RecordsLayout.tsx
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="space-y-6">
      <Outlet />
    </div>
  );
}