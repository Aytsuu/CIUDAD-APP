import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ForwardedCombinedHealthRecordsTable() {
  const [selectedView, setSelectedView] = useState("pending-assessment");
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
    const savedView = localStorage.getItem("selectedMedicalConsultation");
    if (savedView && ["pending-assessment", "medical-consultation", "child-health"].includes(savedView)) {
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
    if (path.includes("/pending-assessment")) {
      setSelectedView("pending-assessment");
    } else if (path.includes("/medical-consultation")) {
      setSelectedView("medical-consultation");
    } else if (path.includes("/child-health")) {
      setSelectedView("child-health");
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setSelectedView(value);
    if (value === "pending-assessment") {
      navigate("/referred-patients/pending-assessment");
    } else if (value === "medical-consultation") {
      navigate("/referred-patients/medical-consultation");
    } else if (value === "child-health") {
      navigate("/referred-patients/child-health");
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
            className="grid w-full sm:w-[500px] gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            }}
          >
            <TabsTrigger
              value="pending-assessment"
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Pending Assessment
            </TabsTrigger>

            <TabsTrigger
              value="medical-consultation"
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Medical Consultation
            </TabsTrigger>

            <TabsTrigger
              value="child-health"
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Child Health
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Outlet />
      </div>
    </MainLayoutComponent>
  );
}
