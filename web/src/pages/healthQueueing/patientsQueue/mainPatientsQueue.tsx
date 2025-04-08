import { useState } from "react";
import PatientsQueueTable from "./patientsQueueTable";
import NoShowTable from "./noShowTable";
import NotArrivedTable from "./notArrivedTable";
import { Button } from "@/components/ui/button/button";

export default function MainPatientQueueTable() {
  const [selectedView, setSelectedView] = useState("queue");

  const renderContent = () => {
    switch (selectedView) {
      case "queue":
        return <PatientsQueueTable />;
      case "notArrived":
        return <NotArrivedTable />;
      case "noShow":
        return <NoShowTable />;
      default:
        return <PatientsQueueTable />;
    }
  };

  const getTitle = () => {
    switch (selectedView) {
      case "queue":
        return "Patients Queue";
      case "notArrived":
        return "Not Arrived Patients";
      case "noShow":
        return "No Show Patients";
      default:
        return "Patients Queue";
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
            Manage and view patients information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-4 sm:mb-6 md:mb-8" />

      {/* Navigation Tabs */}
      <div className="overflow-x-auto pb-2 -mx-2 sm:mx-0">
        <div className="min-w-max sm:min-w-0 px-2 sm:px-0">
          <div className="flex w-full justify-evenly bg-white p-1 rounded-md border-gray">
            {["queue", "notArrived", "noShow"].map((view) => (
              <Button
                key={view}
                variant="ghost"
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-none transition-all duration-200 flex-shrink-0 ${
                  selectedView === view
                    ? "border-b-2 border-b-blue text-blue font-semibold text-sm md:text-base hover:bg-transparent"
                    : "border-b-2 border-transparent text-gray-600 text-sm md:text-base hover:bg-transparent hover:text-blue"
                }`}
              >
                {view === "notArrived"
                  ? "Not Arrived"
                  : view === "noShow"
                  ? "No Show"
                  : "Patient Queue"}
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
