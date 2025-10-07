import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import MainAppointments from "./main-appoimnents"; // Consider renaming the file to fix spelling
import AllMedicalConsRecord from "./AllRecords";
import { useAuth } from "@/context/AuthContext";
import { ProtectedComponentButton } from "@/ProtectedComponentButton";
import { useReportsCount } from "../../count-return/count";

export default function MainMedicalConsultation() {
  const [selectedView, setSelectedView] = useState("records");
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const { data, isLoading } = useReportsCount();

  useEffect(() => {
    setIsMounted(true);
    const savedView = localStorage.getItem("selectedMedicalConsultation"); // Fixed typo
    if (savedView && ["requests", "records"].includes(savedView)) {
      setSelectedView(savedView);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("selectedMedicalConsultation", selectedView); // Fixed typo
    }
  }, [selectedView, isMounted]);

  // Get user position for conditional logic
  const userPosition = user?.staff?.pos;
  const userPositionTitle = typeof userPosition === "string" ? userPosition : userPosition?.pos_title || "";

  // Check if user should have access to requests
  const canAccessRequests = !["Nurse", "Midwife"].some((excludedPos) => 
    userPositionTitle.toLowerCase().includes(excludedPos.toLowerCase())
  );

  // Ensure selectedView is valid based on permissions
  useEffect(() => {
    if (isMounted && selectedView === "requests" && !canAccessRequests) {
      setSelectedView("records"); // Fallback to records if no permission
    }
  }, [isMounted, canAccessRequests, selectedView]);

  if (!isMounted) {
    return null;
  }

  return (
    <MainLayoutComponent 
      title="Medical Consultation Management" 
      description="Manage medical consultation appointments and records efficiently."
    >
      <div className="bg-white p-4">
        <Tabs value={selectedView} className="mb-4" onValueChange={(value) => setSelectedView(value)}>
          <TabsList
            className="grid w-full sm:w-[300px]"
            style={{
              gridTemplateColumns: canAccessRequests ? "1fr 1fr" : "1fr"
            }}
          >
            <TabsTrigger 
              value="records" 
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              All Records
            </TabsTrigger>

            {/* Only show Requests tab if user has permission */}
            {canAccessRequests && (
              <TabsTrigger 
                value="requests" 
                className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative"
              >
                Appointments
                {!isLoading && data?.data?.medrequest_count > 0 && (
                  <span className="ml-2 text-xs font-semibold text-white bg-red-500 rounded-full px-2 h-5 w-5 flex items-center justify-center absolute -top-1 -right-1 min-w-[20px]">
                    {data.data.medrequest_count}
                  </span>
                )}
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        {selectedView === "requests" ? (
          <ProtectedComponentButton exclude={["DOCTOR"]}>
            <MainAppointments /> {/* Fixed component name */}
          </ProtectedComponentButton>
        ) : (
          <AllMedicalConsRecord />
        )}
      </div>
    </MainLayoutComponent>
  );
}