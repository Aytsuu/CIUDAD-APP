import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import { useReportsCount } from "@/pages/healthServices/count-return/count";

const TabConfig = [
  {
    id: "medicine",
    icon: Pill,
    label: "Medicine",
    path: "medicine"
  },
  {
    id: "vaccine", 
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

export default function MainInventoryStocks() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current tab from URL path
  const getCurrentTabFromPath = () => {
    const pathSegments = location.pathname.split("/");
    const currentSegment = pathSegments[pathSegments.length - 1];
    return TabConfig.find(tab => tab.path === currentSegment)?.id || "medicine";
  };

  const [selectedView, setSelectedView] = useState<TabType>(getCurrentTabFromPath);
  const { data: count, isLoading: countLoading } = useReportsCount();

  const [counts, setCounts] = useState({
    medicine: 0,
    vaccine: 0,
    commodity: 0,
    firstaid: 0
  });

  // Update URL when tab changes
  useEffect(() => {
    const currentTab = TabConfig.find(tab => tab.id === selectedView);
    if (currentTab) {
      navigate(currentTab.path, { replace: true });
    }
    localStorage.setItem("mainInventoryStocksView", selectedView);
  }, [selectedView, navigate]);

  // Update selected view when URL changes
  useEffect(() => {
    setSelectedView(getCurrentTabFromPath());
  }, [location.pathname]);

  // Update counts when API data changes
  useEffect(() => {
    if (count?.data) {
      setCounts({
        medicine: count.data.inv_medicine_count || 0,
        vaccine: count.data.inv_antigen_count || 0,
        commodity: count.data.inv_commodity_count || 0,
        firstaid: count.data.inv_firstaid_count || 0
      });
    }
  }, [count]);

  // Get count with loading state
  const getCountDisplay = (count: number, isLoading: boolean) => {
    if (isLoading) return "⋯";
    return count.toString();
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-0">
        <Tabs
          value={selectedView}
          onValueChange={(value) => setSelectedView(value as TabType)}
          className="w-full"
        >
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1">
              {TabConfig.map((tab) => {
                const Icon = tab.icon;
                const countValue = counts[tab.id];
                const isActive = selectedView === tab.id;

                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    <span className={`text-xs rounded-full h-6 w-6 flex items-center justify-center ${
                      isActive 
                        ? "bg-red-500 text-white" 
                        : "bg-red-300 text-white"
                    }`}>
                      {getCountDisplay(countValue, countLoading)}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <CardContent className="p-4 pt-6">
            {/* Render nested tab content */}
            <Outlet />
          </CardContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}