import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

import MaternalTab from "./tabs";
import MaternalAllRecords from "./maternal-all-records";
import MaternalAppointmentsMain from "./appointments/maternal-appointments";
import { usePrenatalAppointmentRequest } from "../queries/maternalFetchQueries";

export default function MaternalMain() {
   const [searchParams] = useSearchParams();
   const tabParam = searchParams.get("tab") || "records";
   const [selectedTab, setSelectedTab] = useState(tabParam);

   // Fetch appointment requests to get pending count
   const { data: appointmentRequests } = usePrenatalAppointmentRequest()
   const pendingCount = appointmentRequests?.status_counts?.pending || 0

   // Update selectedTab when URL parameter changes
   useEffect(() => {
      setSelectedTab(tabParam);
   }, [tabParam]);

   const handleTabChange = (tab: string) => {
      setSelectedTab(tab);
   }

   return (
      <MainLayoutComponent title="Maternal Health" description="Manage mother's maternal records and appointments">
         <div className="w-full h-full flex flex-col bg-white p-4">
            {/* tabs */}
            <div className="w-full">
               <MaternalTab onTabChange={handleTabChange} pendingCount={pendingCount} activeTab={selectedTab} />
            </div>

            {/* content */}
            <div defaultValue={"records"} className="mt-4">
               {
                  selectedTab === "records" ? <MaternalAllRecords /> 
                  : selectedTab === "appointments" ? <MaternalAppointmentsMain /> 
                  : null
               }

            </div>
         </div>
         
      </MainLayoutComponent>
   )
}