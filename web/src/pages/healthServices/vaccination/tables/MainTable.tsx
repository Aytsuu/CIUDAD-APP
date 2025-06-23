import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card/card";
import { Shield, UserX } from "lucide-react";
import AllVaccinationRecords from "./AllVaccinationRecord";
import UnvaccinatedResident from "./UnvaccineResidents";

export default function VaccinationManagement() {
  // Initialize state with value from localStorage or default to "vaccinated"
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
        return "Unvaccinated Residents";
      default:
        return "Vaccination Records";
    }
  };

  const getDescription = () => {
    switch (selectedView) {
      case "vaccinated":
        return "Manage and view patients vaccination information";
      case "unvaccinated":
        return "List of residents who have not received any vaccines";
      default:
        return "Manage and view patients vaccination information";
    }
  };

  return (
    <div className="w-full px-3 py-4 sm:px-6 md:px-8 bg-background">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="mb-4">
          <h1 className="font-semibold text-lg sm:text-xl md:text-2xl text-darkBlue2">
            {getTitle()}
          </h1>
          <p className="text-xs sm:text-sm text-darkGray mt-1">
            {getDescription()}
          </p>
        </div>
      </div>
      <hr className="border-gray mb-4 sm:mb-6 md:mb-8" />

      {/* Tabs Navigation */}
      <Card className="border shadow-sm">
        <CardHeader className="p-0">
          <Tabs
            defaultValue={selectedView}
            value={selectedView}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-2 gap-2 h-auto p-1">
                <TabsTrigger
                  value="vaccinated"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Shield className="h-4 w-4" />
                  <span>Vaccination Records</span>
                </TabsTrigger>
                <TabsTrigger
                  value="unvaccinated"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <UserX className="h-4 w-4" />
                  <span>Unvaccinated Residents</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-4 pt-6">
              <TabsContent value="vaccinated" className="mt-0">
                <AllVaccinationRecords />
              </TabsContent>
              <TabsContent value="unvaccinated" className="mt-0">
                <UnvaccinatedResident />
              </TabsContent>
            </CardContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}