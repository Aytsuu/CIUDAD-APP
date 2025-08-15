import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainInventoryStocks from "./StocksMain";
import ArchiveMainInventoryStocks from "@/pages/healthServices/Archive/Inventory/tables/MainArchiveInventoryStocks";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import TransactionMainInventoryList from "../../transaction/tables/TransactionMainInventoryList";

export default function MainInventory() {
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

  return (
    <MainLayoutComponent
      title="Inventory"
      description="Manage your inventory stocks efficiently."
    >
      <div className="bg-white p-4">
        <Tabs
          defaultValue={selectedView}
          className="mb-4"
          onValueChange={(value) =>
            setSelectedView(value as "stocks" | "archive")
          }
        >
          <TabsList className="grid grid-cols-3  w-full sm:w-[300px]">
            <TabsTrigger
              value="stocks"
              className=" text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
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

        {/* Render the appropriate component based on selectedView */}
        {selectedView === "stocks" && <MainInventoryStocks />}
        {selectedView === "archive" && <ArchiveMainInventoryStocks />}
        {selectedView === "transaction" && <TransactionMainInventoryList />}
      </div>
    </MainLayoutComponent>
  );
}
