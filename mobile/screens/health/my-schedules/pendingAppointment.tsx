// // pendingAppointment.tsx
// import { useAuth } from "@/contexts/AuthContext";
// import { useAllFollowUpVisits } from "./fetch";
// import { useMemo } from "react";
// import { LoadingState } from "@/components/ui/loading-state";

// export const usePendingAppointments = () => {
//   const { user } = useAuth();
//   const rp_id = user?.resident?.rp_id
//   const { data: appointmentsData, isLoading, error } = useAllFollowUpVisits({
//     page_size: 1000
//   });

//   if (isLoading){
//     return <LoadingState/>
//   }
//   // Calculate pending count for current user
//   const pendingCount = useMemo(() => {
//     if (!appointmentsData?.results || !rp_id) return 0;
    
//     // console.log('All appointments:', appointmentsData.results);
//     console.log('Current user ID:', rp_id);
    
//     const userPendingAppointments = appointmentsData.results.filter((appointment: any) => {
//       const patientId = appointment.patient_details?.pat_id;
//       const isForCurrentUser = patientId === rp_id;
//       const isPending = appointment.followv_status?.toLowerCase() === 'pending';
      
//       console.log(`Appointment ${appointment.followv_id}: patientId=${patientId}, isForCurrentUser=${isForCurrentUser}, status=${appointment.followv_status}, isPending=${isPending}`);
      
//       return isForCurrentUser && isPending;
//     });
    
//     console.log('User pending appointments count:', userPendingAppointments.length);
//     return userPendingAppointments.length;
//   }, [appointmentsData, rp_id]);

//   return { pendingCount, isLoading, error };
// };