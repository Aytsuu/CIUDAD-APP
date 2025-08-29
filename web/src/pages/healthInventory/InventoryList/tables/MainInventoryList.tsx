"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card/card";
import { Pill, Syringe, Package, Bandage } from "lucide-react";
import FirstAidList from "./FirstAidList";
import MedicineList from "./MedicineList";
import CommodityList from "./CommodityList";
import AntigenList from "./AntigenList";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

const TabButton = ({
  active,
  type,
  icon: Icon,
  count,
  onClick,
}: {
  active: boolean;
  type: "medicine" | "vaccine" | "commodity" | "firstaid";
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  onClick: () => void;
}) => {
  const config = {
    medicine: {
      borderColor: "border-blue-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-100",
      textColorDark: "text-blue-800",
      iconColor: "text-blue-600",
    },
    vaccine: {
      borderColor: "border-green-600",
      textColor: "text-green-700",
      bgColor: "bg-green-100",
      textColorDark: "text-green-800",
      iconColor: "text-green-600",
    },
    commodity: {
      borderColor: "border-amber-600",
      textColor: "text-amber-700",
      bgColor: "bg-amber-100",
      textColorDark: "text-amber-800",
      iconColor: "text-amber-600",
    },
    firstaid: {
      borderColor: "border-red-600",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
      textColorDark: "text-red-800",
      iconColor: "text-red-600",
    },
  }[type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 text-sm flex flex-row justify-center items-center gap-2 transition-colors border-b-4 ${
        active
          ? `${config.borderColor} ${config.textColor} font-medium`
          : "border-transparent text-gray-600 hover:border-gray-300"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${active ? config.iconColor : "text-gray-500"}`}
      />
      <span className="capitalize">
        {type === "medicine"
          ? "Medicine"
          : type === "vaccine"
          ? "Vaccine"
          : type === "commodity"
          ? "Commodity"
          : "First Aid"}
      </span>
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active
            ? `${config.bgColor} ${config.textColorDark}`
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
};

export default function MainInventoryList() {
  // Retrieve the selected view from local storage, default to "medicine"
  const [selectedView, setSelectedView] = useState(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("selectedView");
      return savedView || "medicine";
    }
    return "medicine";
  });

  // Mock counts for each tab - replace with your actual data
  const [counts, setCounts] = useState({
    medicine: 0,
    vaccine: 0,
    commodity: 0,
    firstaid: 0,
  });

  // Save the selected view to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("selectedView", selectedView);
  }, [selectedView]);

  // TODO: Replace with actual count fetching logic
  useEffect(() => {
    // Simulate fetching counts
    setCounts({
      medicine: 42,
      vaccine: 18,
      commodity: 27,
      firstaid: 15,
    });
  }, []);

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
    <MainLayoutComponent
      title={getTitle()}
      description="Manage your health inventory efficiently"
    >
      <Tabs value={selectedView} onValueChange={handleTabChange} className="w-full">
        <div className="flex gap-2 mb-2 bg-white rounded-md border border-gray-200 h-auto">
          <TabButton
            active={selectedView === "medicine"}
            type="medicine"
            icon={Pill}
            count={counts.medicine}
            onClick={() => setSelectedView("medicine")}
          />
          <TabButton
            active={selectedView === "vaccine"}
            type="vaccine"
            icon={Syringe}
            count={counts.vaccine}
            onClick={() => setSelectedView("vaccine")}
          />
          <TabButton
            active={selectedView === "commodity"}
            type="commodity"
            icon={Package}
            count={counts.commodity}
            onClick={() => setSelectedView("commodity")}
          />
          <TabButton
            active={selectedView === "firstaid"}
            type="firstaid"
            icon={Bandage}
            count={counts.firstaid}
            onClick={() => setSelectedView("firstaid")}
          />
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
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
        </Card>
      </Tabs>
    </MainLayoutComponent>
  );
}