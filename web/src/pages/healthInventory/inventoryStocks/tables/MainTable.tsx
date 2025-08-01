import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <>
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="mb-4">
          <h1 className="font-semibold text-lg sm:text-xl md:text-2xl text-darkBlue2">
            Inventory
          </h1>
          <p className="text-xs sm:text-sm text-darkGray mt-1">
            Manage and view inventory information
          </p>
        </div>

        {/* Stocks and Archive Tabs */}
        <Tabs
          defaultValue="stocks"
          className="mb-4"
          onValueChange={(value) =>
            setSelectedView(value as "stocks" | "archive")
          }
        >
          <TabsList className="grid grid-cols-2 w-full sm:w-[200px]">
            <TabsTrigger
              value="stocks"
              className="py-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Stocks
            </TabsTrigger>
            <TabsTrigger
              value="archive"
              className="py-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Archive
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <hr className="border-gray mb-4 sm:mb-6 md:mb-8" />
    </>
  );
}
