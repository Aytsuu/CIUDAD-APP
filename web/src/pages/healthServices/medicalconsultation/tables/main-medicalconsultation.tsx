import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useAuth } from "@/context/AuthContext";
import { useReportsCount } from "../../count-return/count";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ProtectedComponent } from "@/ProtectedComponent";

export default function MainMedicalConsultation() {
  const [selectedView, setSelectedView] = useState("records");
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading } = useReportsCount();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
    const savedView = localStorage.getItem("selectedMedicalConsultation");
    if (savedView && ["requests", "records"].includes(savedView)) {
      setSelectedView(savedView);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("selectedMedicalConsultation", selectedView);
    }
  }, [selectedView, isMounted]);

 
  // Sync tab selection with current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/appointments")) {
      setSelectedView("requests");
    } else {
      setSelectedView("records");
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setSelectedView(value);
    if (value === "requests") {
      navigate("/services/medical-consultation/appointments");
    } else {
      navigate("/services/medical-consultation/records");
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <MainLayoutComponent 
      title="Medical Consultation Management" 
      description="Manage medical consultation appointments and records efficiently."
    >
      <div className="bg-white p-4">
        <Tabs value={selectedView} className="mb-4" onValueChange={handleTabChange}>
          <TabsList
            className="grid w-full sm:w-[300px]"
            style={{
              gridTemplateColumns:  "1fr 1fr" 
            }}
          >
            <TabsTrigger 
              value="records" 
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              All Records
            </TabsTrigger>

            {/* Only show Requests tab if user has permission */}
              <ProtectedComponent exclude={["DOCTOR"]}>
                <TabsTrigger 
                  value="requests" 
                  className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative"
                >
                  Appointments
                  {!isLoading && data?.data?.total_appointments_count > 0 && (
                    <span className="ml-2 text-xs font-semibold text-white bg-red-500 rounded-full px-2 h-5 w-5 flex items-center justify-center absolute -top-1 -right-1 min-w-[20px]">
                      {data.data.total_appointments_count}
                    </span>
                  )}
                </TabsTrigger>
              </ProtectedComponent>
          
          </TabsList>
        </Tabs>

        {/* Render nested routes */}
        <Outlet />
      </div>
    </MainLayoutComponent>
  );
}