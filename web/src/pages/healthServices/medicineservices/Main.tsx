import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import AllMedicineRecords from "./tables/AllMedicineRecords";
import MedicineRequestMain from "./Request/Main";

export default function MainMedicine() {
  const [selectedView, setSelectedView] = useState("requests"); // Start with direct default
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only access localStorage after component mounts (client-side)
    const savedView = localStorage.getItem("selectedMedicineView");
    if (savedView && ["requests", "records"].includes(savedView)) {
      setSelectedView(savedView);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("selectedMedicineView", selectedView);
    }
  }, [selectedView, isMounted]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <MainLayoutComponent
      title="Medicine Management"
      description="Manage medicine requests and records efficiently."
    >
      <div className="bg-white p-4">
        <Tabs
          value={selectedView} // Use value instead of defaultValue
          className="mb-4"
          onValueChange={(value) => setSelectedView(value)}
        >
          <TabsList className="grid grid-cols-2 w-full sm:w-[300px]">
            <TabsTrigger
              value="requests"
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Medicine Requests
            </TabsTrigger>
            <TabsTrigger
              value="records"
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              All Records
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {selectedView === "requests" && <MedicineRequestMain />}
        {selectedView === "records" && <AllMedicineRecords />}
      </div>
    </MainLayoutComponent>
  );
}