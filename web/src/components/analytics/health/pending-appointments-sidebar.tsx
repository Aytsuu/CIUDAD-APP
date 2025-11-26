import { useState } from "react";
import { usePrenatalAppointmentRequestPendings } from "@/pages/healthServices/maternal/queries/maternalFetchQueries";
import { useAppointments } from "@/pages/healthServices/medicalconsultation/queries/fetch";
import { Card } from "@/components/ui/card";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export const PendingAppointmentsSidebar = () => {
  const [showViewAllDropdown, setShowViewAllDropdown] = useState(false);

  // Fetch prenatal appointments
  const { data: prenatalResponse, isLoading: isPrenatalLoading } = usePrenatalAppointmentRequestPendings();
  
  // Fetch consultation appointments
  const { data: consultationResponse, isLoading: isConsultationLoading } = useAppointments(
    1, 10, "", "all", ["pending"], undefined, true
  );

  const prenatalAppointments = prenatalResponse?.requests || [];
  const consultationAppointments = consultationResponse?.results || [];
  
  // Combine and sort appointments by date
  const combinedAppointments = [
    ...prenatalAppointments.map((apt: any) => ({
      ...apt,
      type: "prenatal",
      sortDate: new Date(apt.requested_at),
      displayDate: apt.requested_date,
    })),
    ...consultationAppointments.map((apt: any) => ({
      ...apt,
      type: "consultation",
      sortDate: new Date(apt.created_at),
      displayDate: apt.created_at,
    }))
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  const totalCount = combinedAppointments.length;
  const isLoading = isPrenatalLoading || isConsultationLoading;

  const calculateDaysPending = (date: string) => {
    const requested = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - requested.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const formatName = (appointment: any) => {
    if (appointment.type === "prenatal") {
      const info = appointment.personal_info;
      return info 
        ? `${info.per_fname || ""} ${info.per_mname || ""} ${info.per_lname || ""}`.trim()
        : "Unknown Patient";
    } else {
      const info = appointment.personal_info;
      const middle = info?.per_mname ? `${info.per_mname[0]}.` : "";
      return `${info?.per_fname || "Unknown"} ${middle} ${info?.per_lname || ""}`;
    }
  };

  const getAppointmentLink = (appointment: any) => {
    if (appointment.type === "prenatal") {
      return `/services/maternal?tab=appointments`;
    }
    return `/services/medical-consultation/appointments/pending`;
  };

  // Display only first 5 appointments
  const displayedAppointments = combinedAppointments.slice(0, 5);

  return (
    <Card className="w-full bg-white h-full flex flex-col border-none">
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
            {displayedAppointments.map((appointment: any, index: number) => (
              <Link
                key={`${appointment.type}-${index}`}
                to={getAppointmentLink(appointment)}
                className="block"
              >
                <Card className="p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-medium text-gray-700 truncate">
                          {formatName(appointment)}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0.5 ${
                            appointment.type === "prenatal"
                              ? "text-pink-600 bg-purple-50 border-pink-500"
                              : appointment.meridiem === "AM"
                              ? "text-yellow-600 bg-yellow-50 border-yellow-500"
                              : "text-blue-600 bg-blue-50 border-blue-500"
                          }`}
                        >
                          {appointment.type === "prenatal" ? "Prenatal" : "Consultation"}
                        </Badge>
                      </div>

                      {appointment.type === "prenatal" && appointment.requested_date && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(appointment.requested_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500">
                          {calculateDaysPending(
                            appointment.type === "prenatal" 
                              ? appointment.requested_at 
                              : appointment.created_at
                          )}
                        </span>
                        <p className="text-orange-500 font-semibold">
                          Pending Request
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-sm font-medium text-purple-700 mb-1">
              No pending appointments
            </h3>
            <p className="text-sm text-gray-500">
              New appointment requests will appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer with dropdown */}
      {totalCount > 0 && (
        <div className="p-4 border-t border-gray-100">
          <DropdownMenu open={showViewAllDropdown} onOpenChange={setShowViewAllDropdown}>
            <DropdownMenuTrigger asChild>
              <Button variant="link" className="w-full justify-between">
                <span>
                  View All Appointments ({totalCount > 100 ? "100+" : totalCount})
                  {totalCount > 5 && <span className="ml-1 text-gray-400">• Showing 5 of {totalCount}</span>}
                </span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/services/medical-consultation/appointments/pending" className="cursor-pointer">
                  <Calendar className="w-4 h-4 mr-2" />
                  Consultation Appointments ({consultationAppointments.length})
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services/maternal?tab=appointments" className="cursor-pointer">
                  <Calendar className="w-4 h-4 mr-2" />
                  Prenatal Appointments ({prenatalAppointments.length})
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
};
