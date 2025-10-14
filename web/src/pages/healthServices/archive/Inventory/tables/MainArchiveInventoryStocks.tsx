import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

type ArchiveInventoryView = "medicine" | "vaccine" | "commodity" | "firstaid";

const ArchiveTabConfig = [
  { id: "medicine" as const, icon: Pill, label: "Medicine", path: "medicine" },
  { id: "vaccine" as const, icon: Syringe, label: "Antigen", path: "vaccine" },
  { id: "commodity" as const, icon: Package, label: "Commodity", path: "commodity" },
  { id: "firstaid" as const, icon: Bandage, label: "First Aid", path: "firstaid" },
];

export default function ArchiveMainInventoryStocks() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current tab from URL path
  const getCurrentTabFromPath = () => {
    const pathSegments = location.pathname.split("/");
    const currentSegment = pathSegments[pathSegments.length - 1];
    return ArchiveTabConfig.find(tab => tab.path === currentSegment)?.id || "medicine";
  };

  const [selectedView, setSelectedView] = useState<ArchiveInventoryView>(getCurrentTabFromPath);

  // Update URL when tab changes
  useEffect(() => {
    const currentTab = ArchiveTabConfig.find(tab => tab.id === selectedView);
    if (currentTab) {
      navigate(currentTab.path, { replace: true });
    }
    localStorage.setItem("archiveInventoryView", selectedView);
  }, [selectedView, navigate]);

  // Update selected view when URL changes
  useEffect(() => {
    setSelectedView(getCurrentTabFromPath());
  }, [location.pathname]);

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
              {ArchiveTabConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
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