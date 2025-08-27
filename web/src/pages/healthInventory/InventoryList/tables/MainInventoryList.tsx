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
    color: "blue"
  },
  {
    id: "antigen",
    icon: Syringe,
    label: "Antigen",
    color: "green"
  },
  {
    id: "commodity",
    icon: Package,
    label: "Commodity",
    color: "amber"
  },
  {
    id: "firstaid",
    icon: Bandage,
    label: "First Aid",
    color: "red"
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

  // Get color classes for text and icons
  const getTextColorClass = (tabId: TabType, isActive: boolean) => {
    if (!isActive) return "text-gray-600";
    
    const colorMap = {
      medicine: "text-blue-700",
      antigen: "text-green-700", 
      commodity: "text-amber-700",
      firstaid: "text-red-700"
    };
    
    return colorMap[tabId];
  };

  // Get color classes for badges
  const getBadgeColorClass = (tabId: TabType, isActive: boolean) => {
    if (!isActive) return "bg-primary/10 text-primary";
    
    const colorMap = {
      medicine: "bg-blue-100 text-blue-700",
      antigen: "bg-green-100 text-green-700", 
      commodity: "bg-amber-100 text-amber-700",
      firstaid: "bg-red-100 text-red-700"
    };
    
    return colorMap[tabId];
  };

  // Get border color classes for active tabs
  const getBorderColorClass = (tabId: TabType) => {
    const colorMap = {
      medicine: "data-[state=active]:border-blue-400",
      antigen: "data-[state=active]:border-green-400", 
      commodity: "data-[state=active]:border-amber-400",
      firstaid: "data-[state=active]:border-red-400"
    };
    
    return colorMap[tabId];
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
                  const textColorClass = getTextColorClass(tab.id, isActive);
                  const badgeColorClass = getBadgeColorClass(tab.id, isActive);
                  const borderColorClass = getBorderColorClass(tab.id);
                  
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={`flex items-center justify-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:rounded-md ${borderColorClass} border border-transparent transition-all ${textColorClass}`}
                    >
                      <Icon className={`h-4 w-4 ${textColorClass}`} />
                      <span className={textColorClass}>{tab.label}</span>
                      <span className={`ml-1 text-xs font-medium px-2 py-0.5 rounded-full ${badgeColorClass}`}>
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