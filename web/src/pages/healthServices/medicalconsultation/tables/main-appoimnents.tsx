import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClipboardList, Clock } from "lucide-react";
import { useReportsCount } from "../../count-return/count";
import PendingMedicalAppointments from "./pending-appoinments";
import ConfirmedMedicalAppointments from "./confirmed-appointments";
import { useNavigate, useLocation } from "react-router-dom";

export default function MainAppointments() {
  const [selectedView, setSelectedView] = useState<string>("appointment");
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading } = useReportsCount();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMounted(true);
    
    // Set initial tab based on URL
    const path = location.pathname;
    if (path.includes("/confirmed")) {
      setSelectedView("appointment");
    } else if (path.includes("/pending")) {
      setSelectedView("pending");
    } else {
      // Default to confirmed appointments
      setSelectedView("appointment");
      navigate("/services/medical-consultation/appointments/confirmed");
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("medicineRequestView", selectedView);
    }
  }, [selectedView, isMounted]);

  const handleTabChange = (value: string) => {
    setSelectedView(value);
    if (value === "appointment") {
      navigate("/services/medical-consultation/appointments/confirmed");
    } else if (value === "pending") {
      navigate("/services/medical-consultation/appointments/pending");
    }
  };

  // Show loading state
  if (!isMounted) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card className="border shadow-sm">
        <CardHeader className="p-0">
          <Tabs value={selectedView} onValueChange={handleTabChange} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-2 gap-2 h-auto p-1">
                <TabsTrigger value="appointment" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <ClipboardList className="h-4 w-4" />
                  <span>Confirmed Appointments</span>
                  {!isLoading && data?.data?.confirmed_appointments_count > 0 && <span className="ml-2 text-xs font-semibold text-white bg-red-500 rounded-full px-2 h-5 w-5 flex items-center justify-center min-w-[20px]">{data.data.confirmed_appointments_count}</span>}
                </TabsTrigger>

                <TabsTrigger value="pending" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Clock className="h-4 w-4" />
                  <span>Pending Confirmation</span>
                  {!isLoading && data?.data?.pending_appointments_count > 0 && <span className="ml-2 text-xs font-semibold text-white bg-red-500 rounded-full px-2 h-5 w-5 flex items-center justify-center min-w-[20px]">{data.data.pending_appointments_count}</span>}
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-4 pt-6">
              <TabsContent value="appointment" className="mt-0">
                <ConfirmedMedicalAppointments />
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                <PendingMedicalAppointments />
              </TabsContent>
            </CardContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}