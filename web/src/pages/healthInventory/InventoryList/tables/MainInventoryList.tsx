"use client"

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import FirstAidList from "./FirstAidList";
import MedicineList from "./MedicineList";
import CommodityList from "./CommodityList";
import AntigenList from "./AntigenList";

export default function MainInventoryList() {
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

  const getTitle = () => {
    switch (selectedView) {
      case "medicine":
        return "Medicine List";
      case "vaccine":
        return "Vaccine List";
      case "commodity":
        return "Commodity List";
      case "firstaid":
        return "First Aid List";
      default:
        return "Medicine List";
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
            Manage and view inventory information
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
                <MedicineList />
              </TabsContent>
              <TabsContent value="vaccine" className="mt-0">
                <AntigenList />
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
    </div>
  );
}