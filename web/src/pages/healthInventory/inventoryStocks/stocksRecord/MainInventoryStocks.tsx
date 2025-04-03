import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import MedicineStocks
 from "./MedicineStocks";
import VaccineStocks from "./VaccineStocks";
import FirstAidStocks from "./FirstAidStocks";
import CommodityStocks from "./CommodityStocks";

export default function MainInventoryStocks() {
  const [selectedView, setSelectedView] = useState("medicine");

  const renderContent = () => {
    switch (selectedView) {
      case "medicine":
        return <MedicineStocks/>;
      case "vaccine":
        return <VaccineStocks/>;
      case "commodity":
        return <CommodityStocks/>;
      case "firstaid":
        return <FirstAidStocks/>;
    }
  };

  const getTitle = () => {
    switch (selectedView) {
      case "medicine":
        return "Medicine Stocks";
      case "vaccine":
        return "Vaccine Stocks";
      case "commodity":
        return "Commodity Stocks";
      case "firstaid":
        return "First Aid Stocks";
      default:
        return "Medicine Stocks";
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
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

      {/* Navigation Tabs */}
      <div className="overflow-x-auto pb-2 -mx-2 sm:mx-0">
        <div className="min-w-max sm:min-w-0 px-2 sm:px-0">
          <div className="flex w-full justify-evenly bg-white p-1 rounded-md border-gray ">
            {["medicine", "vaccine", "commodity", "firstaid"].map((view) => (
              <Button
                key={view}
                variant="ghost"
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-none transition-all duration-200 flex-shrink-0 ${
                  selectedView === view
                    ? "border-b-2 border-b-blue text-blue font-semibold text-sm  md:text-base hover:bg-transparent"
                    : "border-b-2 border-transparent text-gray-600  text-sm md:text-base hover:bg-transparent hover:text-blue"
                }`}
              >
                {view === "firstaid"
                  ? "First Aid"
                  : view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-3 sm:pt-4 md:pt-5">{renderContent()}</div>
    </div>
  );
}