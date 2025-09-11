// pendingAppointment.tsx
import { useAllFollowUpVisits } from "./fetch";
import { useAuth } from "../familyplanning/useAuth";
import { useMemo } from "react";

export const usePendingAppointments = () => {
  const { user } = useAuth();
  
  // Fetch ALL appointments
  const { data: appointmentsData, isLoading, error } = useAllFollowUpVisits({
    page_size: 1000
  });

  // Calculate pending count for current user
  const pendingCount = useMemo(() => {
    if (!appointmentsData?.results || !user?.id) return 0;
    
    console.log('All appointments:', appointmentsData.results);
    console.log('Current user ID:', user.id);
    
    const userPendingAppointments = appointmentsData.results.filter((appointment: any) => {
      const patientId = appointment.patient_details?.pat_id;
      const isForCurrentUser = patientId === user.id;
      const isPending = appointment.followv_status?.toLowerCase() === 'pending';
      
      console.log(`Appointment ${appointment.followv_id}: patientId=${patientId}, isForCurrentUser=${isForCurrentUser}, status=${appointment.followv_status}, isPending=${isPending}`);
      
      return isForCurrentUser && isPending;
    });
    
    console.log('User pending appointments count:', userPendingAppointments.length);
    return userPendingAppointments.length;
  }, [appointmentsData, user?.id]);

  return { pendingCount, isLoading, error };
};