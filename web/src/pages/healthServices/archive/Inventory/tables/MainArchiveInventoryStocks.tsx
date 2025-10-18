import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import MedicineArchiveTable from "./MedicineStocks";
import CombinedStockTable from "./VaccineStocks";
import CommodityArchiveTable from "./CommodityStocks";

type ArchiveInventoryView = "medicine" | "vaccine" | "commodity" | "firstaid";

export default function ArchiveMainInventoryStocks() {
  const [selectedView, setSelectedView] = useState<ArchiveInventoryView>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("archiveInventoryView");
      return (saved as ArchiveInventoryView) || "medicine";
    }
    return "medicine";
  });

  useEffect(() => {
    localStorage.setItem("archiveInventoryView", selectedView);
  }, [selectedView]);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-0">
        <Tabs
          value={selectedView}
          onValueChange={(value) => setSelectedView(value as ArchiveInventoryView)}
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
              <MedicineArchiveTable />
            </TabsContent>
            <TabsContent value="vaccine" className="mt-0">
              <CombinedStockTable />
            </TabsContent>
            <TabsContent value="commodity" className="mt-0">
              <CommodityArchiveTable />
            </TabsContent>
            <TabsContent value="firstaid" className="mt-0">
              <MedicineArchiveTable />
            </TabsContent>
          </CardContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}