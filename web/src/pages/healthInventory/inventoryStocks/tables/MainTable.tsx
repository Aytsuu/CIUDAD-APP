import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainInventoryStocks from "./StocksMain";
import ArchiveMainInventoryStocks from "@/pages/healthServices/archive/Inventory/tables/MainArchiveInventoryStocks";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import TransactionMainInventoryList from "../../transaction/tables/TransactionMainInventoryList";

export default function MainInventory() {
  const [selectedView, setSelectedView] = useState("stocks"); // Start with direct default
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only access localStorage after component mounts (client-side)
    const savedView = localStorage.getItem("selectedInventoryView");
    if (savedView && ["stocks", "archive", "transaction"].includes(savedView)) {
      setSelectedView(savedView);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("selectedInventoryView", selectedView);
    }
  }, [selectedView, isMounted]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <MainLayoutComponent
      title="Inventory"
      description="Manage your inventory stocks efficiently."
    >
      <div className="bg-white p-4">
        <Tabs
          value={selectedView} // Use value instead of defaultValue
          className="mb-4"
          onValueChange={(value) => setSelectedView(value)}
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-[300px]">
            <TabsTrigger
              value="stocks"
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Stocks
            </TabsTrigger>
            <TabsTrigger
              value="archive"
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Archive
            </TabsTrigger>
            <TabsTrigger
              value="transaction"
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Transaction
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {selectedView === "stocks" && <MainInventoryStocks />}
        {selectedView === "archive" && <ArchiveMainInventoryStocks />}
        {selectedView === "transaction" && <TransactionMainInventoryList />}
      </div>
    </MainLayoutComponent>
  );
}