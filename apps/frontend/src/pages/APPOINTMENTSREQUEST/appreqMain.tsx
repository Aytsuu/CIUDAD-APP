import { CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import AppointmentTable from "./appoinmentTable";
import RequestTable from "./requestTable";
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
      default:
        return <AppointmentTable />;
    }
  };
  const getTitle = () => {
    switch (selectedView) {
      case "appointment":
        return "Appointment";
      case "request":
        return "Request";
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl h-full my-10 mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
        <CardHeader className="border-b">

            <div className="flex justify-between">
            <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
          </div>

          <div className="flex gap-2">
            {" "}
            <Button
              variant={selectedView === "appointment" ? "default" : "outline"}
              onClick={() => setSelectedView("appointment")}
              className={
                selectedView === "appointment"
                  ? "bg-blue text-white hover:bg-blue"
                  : ""
              }
            >
              Appointment
            </Button>
            <Button
              variant={selectedView === "request" ? "default" : "outline"}
              onClick={() => setSelectedView("request")}
              className={
                selectedView === "request"
                  ? "bg-green-500 text-white hover:bg-green-500"
                  : ""
              }
            >
              Request
            </Button>
            </div>
        
          </div>
        </CardHeader>

        <CardContent className="mt-5">{renderContent()}</CardContent>
      </div>
    </>
  );
}
