"use client";

import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useReportsCount } from "@/pages/healthServices/count-return/count";

const TabConfig = [
  {
    id: "medicine",
    icon: Pill,
    label: "Medicine",
    path: "medicine"
  },
  {
    id: "antigen",
    icon: Syringe,
    label: "Antigen",
    path: "antigen"
  },
  {
    id: "commodity",
    icon: Package,
    label: "Commodity",
    path: "commodity"
  },
  {
    id: "firstaid",
    icon: Bandage,
    label: "First Aid",
    path: "firstaid"
  }
] as const;

type TabType = (typeof TabConfig)[number]["id"];

export default function MainInventoryList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current tab from URL path
  const getCurrentTabFromPath = () => {
    const pathSegments = location.pathname.split("/");
    const currentSegment = pathSegments[pathSegments.length - 1];
    return TabConfig.find((tab) => tab.path === currentSegment)?.id || "medicine";
  };

  const [selectedView, setSelectedView] = useState<TabType>(getCurrentTabFromPath);
  const { data: count, isLoading: countLoading } = useReportsCount();

  const [counts, setCounts] = useState({
    medicine: 0,
    antigen: 0,
    commodity: 0,
    firstaid: 0
  });

  // Update URL when tab changes
  useEffect(() => {
    const currentTab = TabConfig.find((tab) => tab.id === selectedView);
    if (currentTab) {
      navigate(currentTab.path, { replace: true });
    }
  }, [selectedView, navigate]);

  // Update selected view when URL changes
  useEffect(() => {
    setSelectedView(getCurrentTabFromPath());
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("mainInventoryListView", selectedView);
  }, [selectedView]);

  // Update counts when API data changes
  useEffect(() => {
    if (count?.data) {
      setCounts({
        medicine: count.data.medicine_count || 0,
        antigen: count.data.antigen_count || 0,
        commodity: count.data.commodity_count || 0,
        firstaid: count.data.firstaid_count || 0
      });
    }
  }, [count]);

  const getTitle = () => {
    const tab = TabConfig.find((t) => t.id === selectedView);
    return `${tab?.label} List` || "Inventory List";
  };

  // Get count with loading state
  const getCountDisplay = (count: number, isLoading: boolean) => {
    if (isLoading) return "⋯";
    return count.toString();
  };

  const handleTabChange = (value: string) => {
    setSelectedView(value as TabType);
  };

  return (
    <MainLayoutComponent title={getTitle()} description="Manage your health inventory efficiently">
      <Card className="border shadow-sm">
        <CardHeader className="p-0">
          <Tabs value={selectedView} onValueChange={handleTabChange} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1">
                {TabConfig.map((tab) => {
                  const Icon = tab.icon;
                  const countValue = counts[tab.id];
                  const isActive = selectedView === tab.id;

                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className={`flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative`}>
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      <span className={`text-xs rounded-full h-6 w-6 flex items-center justify-center ${isActive ? "bg-red-500 text-white" : "bg-red-300 text-white"}`}>{getCountDisplay(countValue, countLoading)}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <CardContent className="p-4 pt-6">
              <Outlet />
            </CardContent>
          </Tabs>
        </CardHeader>
      </Card>
    </MainLayoutComponent>
  );
}
