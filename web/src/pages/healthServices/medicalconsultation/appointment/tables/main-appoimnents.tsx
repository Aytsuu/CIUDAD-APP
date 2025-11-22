import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClipboardList, Clock, Share2, XCircle, Ban, AlarmClockOff, CheckCircle } from "lucide-react";
import { useReportsCount } from "../../../count-return/count";
import PendingMedicalAppointments from "./pending-appointments";
import ConfirmedMedicalAppointments from "./confirmed-appointments";
import ReferredMedicalAppointments from "./referred-appointment";
import CancelledMedicalAppointments from "./cancelled-appointments";
import RejectedMedicalAppointments from "./rejected-appointments";
import MissedMedicalAppointments from "./missed-appointments";
import CompletedMedicalAppointments from "./completed-appointments";
import { useNavigate, useLocation } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button/button";

export default function MainAppointments() {
  const [selectedView, setSelectedView] = useState<string>("appointment");
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading } = useReportsCount();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMounted(true);
    const path = location.pathname;
    if (path.includes("/confirmed")) {
      setSelectedView("appointment");
    } else if (path.includes("/pending")) {
      setSelectedView("pending");
    } else if (path.includes("/referred")) {
      setSelectedView("referred");
    } else if (path.includes("/cancelled")) {
      setSelectedView("cancelled");
    } else if (path.includes("/rejected")) {
      setSelectedView("rejected");
    } else if (path.includes("/missed")) {
      setSelectedView("missed");
    } else if (path.includes("/completed")) {
      setSelectedView("completed");
    } else {
      setSelectedView("appointment");
      navigate("/services/medical-consultation/appointments/confirmed");
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (value: string) => {
    setSelectedView(value);
    if (value === "appointment") {
      navigate("/services/medical-consultation/appointments/confirmed");
    } else if (value === "pending") {
      navigate("/services/medical-consultation/appointments/pending");
    } else if (value === "referred") {
      navigate("/services/medical-consultation/appointments/referred");
    } else if (value === "cancelled") {
      navigate("/services/medical-consultation/appointments/cancelled");
    } else if (value === "rejected") {
      navigate("/services/medical-consultation/appointments/rejected");
    } else if (value === "missed") {
      navigate("/services/medical-consultation/appointments/missed");
    } else if (value === "completed") {
      navigate("/services/medical-consultation/appointments/completed");
    }
  };

  if (!isMounted) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full over">
      <div className="flex gap-2 justify-between pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Header - Stacks vertically on mobile */}
          <Button
            className="text-black p-2 self-start"
            variant={"outline"}
            onClick={() => {
              navigate("/services/medical-consultation/records");
            }}
          >
            <BsChevronLeft />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Medical Consultation Appointments
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">Manage medical consultation appointments efficiently.</p>
          </div>
        </div>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="w-full">
      <Card className="border shadow-sm">
        <CardHeader className="p-0">
          <Tabs value={selectedView} onValueChange={handleTabChange} className="w-full">
            <div className="px-2 sm:px-4 pt-2 sm:pt-4">
              <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1 sm:gap-2 h-auto p-1">
                <TabsTrigger value="pending" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Pending</span>
                  {!isLoading && data?.data?.pending_appointments_count > 0 && (
                    <span className="text-[10px] sm:text-xs font-semibold text-white bg-red-500 rounded-full px-1.5 sm:px-2 h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] flex items-center justify-center">{data.data.pending_appointments_count > 99 ? "99+" : data.data.pending_appointments_count}</span>
                  )}
                </TabsTrigger>

                <TabsTrigger value="appointment" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Confirmed</span>
                  {!isLoading && data?.data?.confirmed_appointments_count > 0 && (
                    <span className="text-[10px] sm:text-xs font-semibold text-white bg-red-500 rounded-full px-1.5 sm:px-2 h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] flex items-center justify-center">{data.data.confirmed_appointments_count > 99 ? "99+" : data.data.confirmed_appointments_count}</span>
                  )}
                </TabsTrigger>

                <TabsTrigger value="completed" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Completed</span>
                  {!isLoading && data?.data?.completed_appointments_count > 0 && (
                    <span className="text-[10px] sm:text-xs font-semibold text-white bg-red-500 rounded-full px-1.5 sm:px-2 h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] flex items-center justify-center">{data.data.completed_appointments_count > 99 ? "99+" : data.data.completed_appointments_count}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="referred" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Referred</span>
                  {!isLoading && data?.data?.referred_appointments_count > 0 && (
                    <span className="text-[10px] sm:text-xs font-semibold text-white bg-red-500 rounded-full px-1.5 sm:px-2 h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] flex items-center justify-center">{data.data.referred_appointments_count > 99 ? "99+" : data.data.referred_appointments_count}</span>
                  )}
                </TabsTrigger>

                <TabsTrigger value="cancelled" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Cancelled</span>
                  {!isLoading && data?.data?.cancelled_appointments_count > 0 && (
                    <span className="text-[10px] sm:text-xs font-semibold text-white bg-red-500 rounded-full px-1.5 sm:px-2 h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] flex items-center justify-center">{data.data.cancelled_appointments_count > 99 ? "99+" : data.data.cancelled_appointments_count}</span>
                  )}
                </TabsTrigger>

                <TabsTrigger value="rejected" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Ban className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Rejected</span>
                  {!isLoading && data?.data?.rejected_appointments_count > 0 && (
                    <span className="text-[10px] sm:text-xs font-semibold text-white bg-red-500 rounded-full px-1.5 sm:px-2 h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] flex items-center justify-center">{data.data.rejected_appointments_count > 99 ? "99+" : data.data.rejected_appointments_count}</span>
                  )}
                </TabsTrigger>

                <TabsTrigger value="missed" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <AlarmClockOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Missed</span>
                  {!isLoading && data?.data?.missed_appointments_count > 0 && (
                    <span className="text-[10px] sm:text-xs font-semibold text-white bg-red-500 rounded-full px-1.5 sm:px-2 h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] flex items-center justify-center">{data.data.missed_appointments_count > 99 ? "99+" : data.data.missed_appointments_count}</span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-2 sm:p-4 pt-4 sm:pt-6">
              <TabsContent value="appointment" className="mt-0">
                <ConfirmedMedicalAppointments />
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                <PendingMedicalAppointments />
              </TabsContent>

              <TabsContent value="referred" className="mt-0">
                <ReferredMedicalAppointments />
              </TabsContent>

              <TabsContent value="cancelled" className="mt-0">
                <CancelledMedicalAppointments />
              </TabsContent>

              <TabsContent value="rejected" className="mt-0">
                <RejectedMedicalAppointments />
              </TabsContent>

              <TabsContent value="missed" className="mt-0">
                <MissedMedicalAppointments />
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                <CompletedMedicalAppointments />
              </TabsContent>
            </CardContent>
          </Tabs>
        </CardHeader>
      </Card>
      </div>
    </div>
  );
}
