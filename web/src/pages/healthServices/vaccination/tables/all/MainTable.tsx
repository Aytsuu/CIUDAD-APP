import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardLayout from "@/components/ui/card/card-layout";
import { Shield, UserX } from "lucide-react";
import AllVaccinationRecords from "./AllVaccinationRecord";
import UnvaccinatedResident from "./UnvaccineResidents";
import { ProtectedComponent } from "@/ProtectedComponent";

export default function VaccinationManagement() {
  const [selectedView, setSelectedView] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedVaccinationView") || "vaccinated";
    }
    return "vaccinated";
  });

  // Update localStorage whenever selectedView changes
  useEffect(() => {
    localStorage.setItem("selectedVaccinationView", selectedView);
  }, [selectedView]);

  const handleTabChange = (value: string) => {
    setSelectedView(value);
  };

  const getTitle = () => {
    switch (selectedView) {
      case "vaccinated":
        return "Vaccination Records";
      case "unvaccinated":
        return "Resident Vaccination Tracking";
      default:
        return "Vaccination Records";
    }
  };

  const getDescription = () => {
    switch (selectedView) {
      case "vaccinated":
        return "Manage and view patients vaccination information";
      case "unvaccinated":
        return "List of residents who are unvaccinated,partially vaccinated and fully vaccinated";
      default:
        return "Manage and view patients vaccination information";
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">{getTitle()}</h1>
          <p className="text-xs sm:text-sm text-darkGray">{getDescription()}</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <CardLayout
        content={
          <Tabs defaultValue={selectedView} value={selectedView} onValueChange={handleTabChange} className="w-full">
              <TabsList
                className="grid w-full sm:w-[450px]"
                style={{
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                <TabsTrigger value="vaccinated" className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <span>Vaccination Records</span>
                </TabsTrigger>

                <ProtectedComponent exclude={["DOCTOR"]}>
                  <TabsTrigger value="unvaccinated"  className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <span>Resident Vaccination Tracking</span>
                  </TabsTrigger>
                </ProtectedComponent>
              </TabsList>
 

            <div className="p-2 pt-6">
              <TabsContent value="vaccinated" className="mt-0">
                <AllVaccinationRecords />
              </TabsContent>
              <TabsContent value="unvaccinated" className="mt-0">
                <UnvaccinatedResident />
              </TabsContent>
            </div>
          </Tabs>
        }
      />
    </>
  );
}
