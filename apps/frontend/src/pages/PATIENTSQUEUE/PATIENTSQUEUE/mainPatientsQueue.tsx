import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PatientsQueueTable from "./patientsQueueTable";
import NoShowTable from "./noShowTable";
import NotArrivedTable from "./notArrivedTable";
import { useState } from "react";

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
        return "Not Arrived";
      case "noShow":
        return "No Show";
      default:
        return "Patients Queue";
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            {getTitle()}
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <div className="flex justify-start ">
        <div className="flex bg-white p-2  rounded-md gap-3 border-gray border">
          <Button
            variant={selectedView === "queue" ? "default" : "outline"}
            onClick={() => setSelectedView("queue")}
            className={
              selectedView === "queue"
                ? "hover:text-white hover:bg-blue bg-blue text-white"
                : ""
            }
          >
            Patient Queue
          </Button>
          <Button
            variant={selectedView === "notArrived" ? "default" : "outline"}
            onClick={() => setSelectedView("notArrived")}
            className={
              selectedView === "notArrived"
                ? "bg-green-500 text-white hover:bg-green-500"
                : ""
            }
          >
            Not Arrived
          </Button>
          <Button
            variant={selectedView === "noShow" ? "default" : "outline"}
            onClick={() => setSelectedView("noShow")}
            className={
              selectedView === "noShow"
                ? "bg-red-500 text-white hover:bg-red-500"
                : ""
            }
          >
            No Show
          </Button>
        </div>
      </div>

      <div className="pt-5">{renderContent()}</div>
    </div>
  );
}
