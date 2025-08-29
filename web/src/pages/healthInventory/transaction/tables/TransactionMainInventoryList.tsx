import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import VaccinationList from "./TransactionAntigen";
import FirstAidList from "./TransactionFirstAidList";
import MedicineTransactionTable from "./TransactionMedicineList";
import CommodityTransactionTable from "./TransactionCommodityList";

export default function TransactionMainInventoryList() {
  const [selectedView, setSelectedView] = useState<string>("medicine");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only check localStorage after component mounts
    const savedView = localStorage.getItem("selectedView");
    if (savedView && ["medicine", "antigen", "commodity", "firstaid"].includes(savedView)) {
      setSelectedView(savedView);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("selectedView", selectedView);
    }
  }, [selectedView, isMounted]);

  if (!isMounted) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-0">
        <Tabs
          value={selectedView}
          onValueChange={setSelectedView}
          className="w-md"
        >
          <div className="px-4 pt-4">
            <TabsList className="w-md grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1">
              <TabsTrigger
                value="medicine"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
              >
                <Pill className="h-4 w-4" />
                <span>Medicine</span>
              </TabsTrigger>
              <TabsTrigger
                value="antigen"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
              >
                <Syringe className="h-4 w-4" />
                <span>Antigen</span>
              </TabsTrigger>
              <TabsTrigger
                value="commodity"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
              >
                <Package className="h-4 w-4" />
                <span>Commodity</span>
              </TabsTrigger>
              <TabsTrigger
                value="firstaid"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
              >
                <Bandage className="h-4 w-4" />
                <span>First Aid</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-4 pt-6">
            <TabsContent value="medicine" className="mt-0">
              <MedicineTransactionTable />
            </TabsContent>
            <TabsContent value="antigen" className="mt-0">
              <VaccinationList />
            </TabsContent>
            <TabsContent value="commodity" className="mt-0">
              <CommodityTransactionTable />
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