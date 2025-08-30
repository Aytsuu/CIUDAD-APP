"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import FirstAidList from "./FirstAidList";
import MedicineList from "./MedicineList";
import CommodityList from "./CommodityList";
import AntigenList from "./AntigenList";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useMedicinelistCount } from "../queries/medicine/MedicineFetchQueries";
import { useCommoditylistCount } from "../queries/commodity/CommodityFetchQueries";

const TabConfig = [
  {
    id: "medicine",
    icon: Pill,
    label: "Medicine",
  },
  {
    id: "antigen",
    icon: Syringe,
    label: "Antigen",
  },
  {
    id: "commodity",
    icon: Package,
    label: "Commodity",
  },
  {
    id: "firstaid",
    icon: Bandage,
    label: "First Aid",
  }
] as const;

type TabType = (typeof TabConfig)[number]["id"];

export default function MainInventoryList() {
  const [selectedView, setSelectedView] = useState<TabType>(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("selectedView");
      return (savedView as TabType) || "medicine";
    }
    return "medicine";
  });

  const { data: medicinelistcount, isLoading: isLoadingMedicineCount } = useMedicinelistCount();
  const { data: commoditylistcount, isLoading: isLoadingCommodityCount } = useCommoditylistCount();

  const [counts, setCounts] = useState({
    medicine: 0,
    antigen: 0,
    commodity: 0,
    firstaid: 0
  });

  useEffect(() => {
    localStorage.setItem("selectedView", selectedView);
  }, [selectedView]);

  // Update counts when API data changes
  useEffect(() => {
    setCounts(prev => ({
      ...prev,
      medicine: medicinelistcount?.count || 0,
      commodity: commoditylistcount?.count || 0
    }));
  }, [medicinelistcount, commoditylistcount]);

  const getTitle = () => {
    const tab = TabConfig.find(t => t.id === selectedView);
    return `${tab?.label} List` || "Inventory List";
  };

  // Get count with loading state
  const getCountDisplay = (count: number, isLoading: boolean) => {
    if (isLoading) return "⋯";
    return count.toString();
  };

  return (
    <MainLayoutComponent title={getTitle()} description="Manage your health inventory efficiently">
      <Card>
        <div className="relative">
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as TabType)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 h-auto rounded-md bg-white border border-gray-200 shadow-sm">
                {TabConfig.map((tab) => {
                  const Icon = tab.icon;
                  const count = counts[tab.id];
                  const isLoading = tab.id === "medicine" ? isLoadingMedicineCount : 
                                  tab.id === "commodity" ? isLoadingCommodityCount : false;
                  const isActive = selectedView === tab.id;
                  
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={`flex items-center justify-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:shadow-sm data-[state=active]:rounded-md border border-transparent transition-all ${
                        isActive ? "text-primary" : "text-gray-600"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-gray-600"}`} />
                      <span className={isActive ? "text-primary" : "text-gray-600"}>{tab.label}</span>
                      <span className={`ml-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        isActive ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-600"
                      }`}>
                        {getCountDisplay(count, isLoading)}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <div className="relative p-4">
                <TabsContent value="medicine" className="mt-0">
                  <MedicineList />
                </TabsContent>
                
                <TabsContent value="antigen" className="mt-0">
                  <AntigenList />
                </TabsContent>
                
                <TabsContent value="commodity" className="mt-0">
                  <CommodityList />
                </TabsContent>
                
                <TabsContent value="firstaid" className="mt-0">
                  <FirstAidList />
                </TabsContent>
              </div>
          </Tabs>
        </div>
      </Card>
    </MainLayoutComponent>
  );
}