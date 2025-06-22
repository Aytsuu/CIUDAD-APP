
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import MedicineStocks from "./MedicineStocks";
import VaccineStocks from "./VaccineStocks";
import FirstAidStocks from "./FirstAidStocks";
import CommodityStocks from "./CommodityStocks";

export default function ArchiveMainInventoryStocks() {
  // Initialize state with value from localStorage or default to "medicine"
  const [selectedView, setSelectedView] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedInventoryView") || "medicine";
    }
    return "medicine";
  });

  // Update localStorage whenever selectedView changes
  useEffect(() => {
    localStorage.setItem("selectedInventoryView", selectedView);
  }, [selectedView]);

  const handleTabChange = (value: string) => {
    setSelectedView(value);
  };



  return (
    <div className="w-full px-3 py-4 sm:px-6 md:px-8 bg-background">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="mb-4">
          <h1 className="font-semibold text-lg sm:text-xl md:text-2xl text-darkBlue2">
           Archived
          </h1>
          <p className="text-xs sm:text-sm text-darkGray mt-1">
             View list of archived inventory
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
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1">
                <TabsTrigger
                  value="medicine"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Pill className="h-4 w-4" />
                  <span>Medicine</span>
                </TabsTrigger>
                <TabsTrigger
                  value="vaccine"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Syringe className="h-4 w-4" />
                  <span>Vaccine</span>
                </TabsTrigger>
                <TabsTrigger
                  value="commodity"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Package className="h-4 w-4" />
                  <span>Commodity</span>
                </TabsTrigger>
                <TabsTrigger
                  value="firstaid"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Bandage className="h-4 w-4" />
                  <span>First Aid</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-4 pt-6">
              <TabsContent value="medicine" className="mt-0">
                <MedicineStocks />
              </TabsContent>
              <TabsContent value="vaccine" className="mt-0">
                <VaccineStocks />
              </TabsContent>
              <TabsContent value="commodity" className="mt-0">
                <CommodityStocks />
              </TabsContent>
              <TabsContent value="firstaid" className="mt-0">
                <FirstAidStocks />
              </TabsContent>
            </CardContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}