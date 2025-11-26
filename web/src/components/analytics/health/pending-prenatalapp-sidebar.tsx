import { usePrenatalAppointmentRequestPendings } from "@/pages/healthServices/maternal/queries/maternalFetchQueries";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export const PendingPrenatalAppSidebar = () => {
   const { data: apiResponse, isLoading } = usePrenatalAppointmentRequestPendings();
   
   const appointments = apiResponse?.requests || [];
   const totalCount = appointments.length || 0;

   const calculateDaysPending = (requestedAt: string) => {
      const requested = new Date(requestedAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - requested.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      return `${diffDays} days ago`;
   };

   const getAppointmentDate = (requestedDate: string) => {
      const date = new Date(requestedDate);
      return date.toLocaleDateString('en-US', { 
         month: 'short', 
         day: 'numeric', 
         year: 'numeric' 
      });
   };

   // only first 5 appointments
   const displayedAppointments = appointments.slice(0, 5);

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
                     <Card
                        key={index}
                        className="p-4 border border-gray-200"
                     >
                        <div className="flex items-center gap-3">
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                 <h3 className="text-sm font-medium text-gray-700 truncate">
                                    {appointment.personal_info 
                                       ? `${appointment.personal_info.per_fname || ""} ${appointment.personal_info.per_mname || ""} ${appointment.personal_info.per_lname || ""}`.trim()
                                       : "Unknown Patient"
                                    }
                                 </h3>
                                 <Badge 
                                    variant="outline" 
                                    className="text-xs px-2 py-0.5 text-pink-600 bg-purple-50 border-pink-500"
                                 >
                                    Prenatal
                                 </Badge>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                 <Calendar className="w-3 h-3" />
                                 <span>{getAppointmentDate(appointment.requested_date)}</span>
                              </div>

                              <div className="flex items-center gap-3 text-xs">
                                 <span className="text-gray-500">{calculateDaysPending(appointment.requested_at)}</span>
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
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                     <Calendar className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-sm font-medium text-purple-700 mb-1">
                     No pending appointments
                  </h3>
                  <p className="text-sm text-gray-500">
                     New prenatal appointment requests will appear here
                  </p>
               </div>
            )}
         </div>

         {/* footer */}
         {totalCount > 0 && (
            <div className="p-4 border-t border-gray-100">
               <Link to="/services/maternal?tab=appointments">
                  <Button variant="link">
                     View All Prenatal Appointments ({totalCount > 100 ? "100+" : totalCount})
                     {totalCount > 5 && <span className="ml-1 text-gray-400">• Showing 5 of {totalCount}</span>}
                  </Button>
               </Link>
            </div>
         )}
      </Card>
   );
}