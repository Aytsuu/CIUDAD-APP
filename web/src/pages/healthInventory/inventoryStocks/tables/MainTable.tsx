import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

export default function MainInventory() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current view from URL path
  const getCurrentViewFromPath = () => {
    const pathSegments = location.pathname.split("/");
    const currentSegment = pathSegments[pathSegments.length - 2]; // Get the segment before the last one
    return ["stocks", "archive", "transaction"].includes(currentSegment) 
      ? currentSegment 
      : "stocks";
  };

  const [selectedView, setSelectedView] = useState(getCurrentViewFromPath);

  // ONLY update URL when user actively clicks a tab
  const handleTabChange = (value: string) => {
    setSelectedView(value);
    // Navigate to the new tab's default route
    const defaultRoutes = {
      stocks: "stocks/medicine",
      archive: "archive/medicine", 
      transaction: "transaction/medicine"
    };
    navigate(defaultRoutes[value as keyof typeof defaultRoutes], { replace: true });
  };

  // Update selected view when URL changes (but don't navigate)
  useEffect(() => {
    setSelectedView(getCurrentViewFromPath());
  }, [location.pathname]);

  return (
    <MainLayoutComponent
      title="Inventory Stocks"
      description="Manage your inventory stocks efficiently."
    >
      <div className="bg-white p-4">
        <Tabs
          value={selectedView}
          className="mb-4"
          onValueChange={handleTabChange} // Use the fixed handler
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-[300px]">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
          </TabsList>
        </Tabs>

        <Outlet />
      </div>
    </MainLayoutComponent>
  );
}