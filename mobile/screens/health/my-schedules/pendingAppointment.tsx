// pendingAppointment.tsx - Updated to work with resident appointments
import { useAuth } from "@/contexts/AuthContext";
import { useAppointmentsByResidentId } from "./fetch";
import { useMemo } from "react";

export const usePendingAppointments = () => {
  const { user } = useAuth();
  const rp_id = user?.rp;
  
  const { data: appointmentsData, isLoading, error } = useAppointmentsByResidentId(rp_id || "");

  // Calculate pending count for current user from all appointment types
  const pendingCount = useMemo(() => {
    if (!appointmentsData || !rp_id) return 0;
    
    let count = 0;

    // Count pending follow-up appointments
    if (appointmentsData.follow_up_appointments) {
      count += appointmentsData.follow_up_appointments.filter(
        (appointment: any) => appointment.followv_status?.toLowerCase() === 'pending'
      ).length;
    }

    // Count pending medical consultation appointments
    if (appointmentsData.med_consult_appointments) {
      count += appointmentsData.med_consult_appointments.filter(
        (appointment: any) => appointment.status?.toLowerCase() === 'pending'
      ).length;
    }

    // Count pending prenatal appointments
    if (appointmentsData.prenatal_appointments) {
      count += appointmentsData.prenatal_appointments.filter(
        (appointment: any) => appointment.status?.toLowerCase() === 'pending'
      ).length;
    }

    return count;
  }, [appointmentsData, rp_id]);

  return { pendingCount, isLoading, error };
};