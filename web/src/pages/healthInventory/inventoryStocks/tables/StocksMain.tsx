
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import MedicineStocks from "./MedicineStocks";
import VaccineStocks from "./VaccineStocks";
import FirstAidStocks from "./FirstAidStocks";
import CommodityStocks from "./CommodityStocks";

export default function MainInventoryStocks() {
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
  );
}