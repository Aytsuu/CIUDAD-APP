import { CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import AppointmentTable from "./appoinmentTable";
import RequestTable from "./medrequestTable";
import MedicineRequestStatusTable from "./toReceivedMedicineTable";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AppRequestMain() {
  const [selectedView, setSelectedView] = useState("appointment");
  const renderContent = () => {
    switch (selectedView) {
      case "appointment":
        return <AppointmentTable />;
      case "request":
        return <RequestTable />;
      case "medRequest":
        return <MedicineRequestStatusTable />;
      default:
        return <AppointmentTable />;
    }
  };
  const getTitle = () => {
    switch (selectedView) {
      case "appointment":
        return "Medical Appointment";
      case "request":
        return "Medicine Request";
      case "medRequest":
        return "Medicine Received Status";
    }
  };

  return (
    <>
      <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-col items-center mb-4">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              {getTitle()}{" "}
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view patients information
            </p>
          </div>
        </div>
        <hr className="border-gray mb-6 sm:mb-10" />
        <div className="w-full">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex flex-col sm:flex-row gap-2 bg-white p-1 border-gray border rounded-md w-full">
              <Button
                variant={selectedView === "appointment" ? "default" : "outline"}
                onClick={() => setSelectedView("appointment")}
                className={`w-full ${
                  selectedView === "appointment"
                    ? "bg-blue text-white hover:bg-blue"
                    : "border border-none shadow-none"
                }`}
              >
                Medical Appointments
              </Button>
              <Button
                variant={selectedView === "request" ? "default" : "outline"}
                onClick={() => setSelectedView("request")}
                className={`w-full ${
                  selectedView === "request"
                    ? "bg-blue text-white hover:bg-blue"
                    : "border border-none shadow-none"
                }`}
              >
                Medicine Request
              </Button>
              <Button
                variant={
                  selectedView === "medRequestStatus" ? "default" : "outline"
                }
                onClick={() => setSelectedView("medRequest")}
                className={`w-full ${
                  selectedView === "medRequest"
                    ? "bg-blue text-white hover:bg-blue hover:text-white"
                    : "border border-none shadow-none"
                }`}
              >
                Medicine Receive Status
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-5">{renderContent()}</div>
      </div>
    </>
  );
}
