import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card/card";
import { Pill, Syringe, Package, LigatureIcon as Bandage } from "lucide-react";
import VaccinationList from "./TransactionAntigen";
import FirstAidList from "./TransactionFirstAidList";
import MedicineList from "./TransactionMedicineList";
import CommodityList from "./TransactionCommodityList";

export default function TransactionMainInventoryList() {
  // Retrieve the selected view from local storage, default to "medicine"
  const [selectedView, setSelectedView] = useState(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("selectedView");
      return savedView || "medicine";
    }
    return "medicine";
  });

  // Save the selected view to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("selectedView", selectedView);
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
          <div className="px-4 pt-6">
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1 bg-white shadow-md rounded-full">
              <TabsTrigger
                value="medicine"
                className="flex items-center gap-2 py-3 data-[state=active]:text-primary data-[state=active]:bg-blue-100 data-[state=active]:border-primary rounded-full"
              >
                <Pill className="h-4 w-4" />
                <span>Medicine</span>
              </TabsTrigger>
              <TabsTrigger
                value="antigen"
                className="flex items-center gap-2 py-3 data-[state=active]:text-primary data-[state=active]:bg-blue-100 data-[state=active]:border-primary rounded-full"
              >
                <Syringe className="h-4 w-4" />
                <span>Antigen</span>
              </TabsTrigger>
              <TabsTrigger
                value="commodity"
                className="flex items-center gap-2 py-3 data-[state=active]:text-primary data-[state=active]:bg-blue-100 data-[state=active]:border-primary rounded-full"
              >
                <Package className="h-4 w-4" />
                <span>Commodity</span>
              </TabsTrigger>
              <TabsTrigger
                value="firstaid"
                className="flex items-center gap-2 py-3 data-[state=active]:text-primary data-[state=active]:bg-blue-100 data-[state=active]:border-primary rounded-full"
              >
                <Bandage className="h-4 w-4" />
                <span>First Aid</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-4 pt-6">
            <TabsContent value="medicine" className="mt-0">
              <MedicineList />
            </TabsContent>
            <TabsContent value="antigen" className="mt-0">
              <VaccinationList />
            </TabsContent>
            <TabsContent value="commodity" className="mt-0">
              <CommodityList />
            </TabsContent>
            <TabsContent value="firstaid" className="mt-0">
              <FirstAidList />
            </TabsContent>
          </CardContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
