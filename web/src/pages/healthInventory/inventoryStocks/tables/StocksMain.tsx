import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import MedicineStocks from "./MedicineStocks";
import VaccineStocks from "./VaccineStocks";
import FirstAidStocks from "./FirstAidStocks";
import CommodityStocks from "./CommodityStocks";

export default function MainInventoryStocks() {
  const [selectedView, setSelectedView] = useState<string>("medicine"); // Start with default value
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only check localStorage after component mounts
    const savedView = localStorage.getItem("mainInventoryStocksView");
    if (savedView && ["medicine", "vaccine", "commodity", "firstaid"].includes(savedView)) {
      setSelectedView(savedView);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("mainInventoryStocksView", selectedView);
    }
  }, [selectedView, isMounted]);

  if (!isMounted) {
    return <div className="p-4">Loading...</div>; // Show loading state
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-0">
        <Tabs
          value={selectedView}
          onValueChange={setSelectedView}
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
                <span>Antigen</span>
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