import { Card } from "@/components/ui/card";
import {  Calendar } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAppointments } from "@/pages/healthServices/medicalconsultation/queries/fetch";

export const PendingMedicalAppointmentsSidebar = () => {
  const { data: apiResponse, isLoading } = useAppointments(
    1,           
    10,         
    "",         
    "all",       
    ["pending"], 
    undefined,   
    true        
  );

  const appointments = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;

  const formatName = (
    firstName: string,
    middleName: string,
    lastName: string
  ) => {
    const middle = middleName ? `${middleName[0]}.` : "";
    return `${firstName} ${middle} ${lastName}`;
  };

  const calculateDaysPending = (requestedDate: string) => {
    const requested = new Date(requestedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - requested.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  // Display only first 5 appointments
  const displayedAppointments = appointments.slice(0, 5);

  return (
    <Card className="w-full bg-white h-full flex flex-col border-none">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedAppointments.length > 0 ? (
          <div className="p-4 space-y-3">
            {displayedAppointments.map((appointment: any) => (
              <Card
                key={appointment.id}
                className="p-4 border border-gray-200"
              >
                <div className="flex items-center gap-14">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-700 truncate">
                        {formatName(
                          appointment.personal_info?.per_fname || "Unknown",
                          appointment.personal_info?.per_mname || "",
                          appointment.personal_info?.per_lname || ""
                        )}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${
                          appointment.meridiem === "AM" 
                            ? "text-yellow-600 bg-yellow-50 border-yellow-500" 
                            : "text-blue-600 bg-blue-50 border-blue-500"
                        }`}
                      >
                        {appointment.meridiem}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{calculateDaysPending(appointment.created_at)}</span>
                      <p className="text-orange-500 font-semibold">
                        Pending Request
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">
              No pending appointments
            </h3>
            <p className="text-sm text-gray-500">
              New appointment requests will appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {totalCount > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Link to="/medical-consultation/appointments/pending">
            <Button variant="link">
              View All Appointments ({totalCount > 100 ? "100+" : totalCount})
              {totalCount > 5 && <span className="ml-1 text-gray-400">• Showing 5 of {totalCount}</span>}
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};