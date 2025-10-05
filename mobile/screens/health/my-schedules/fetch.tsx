import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getResident, getPatients, getPatientDetails, AppointmentFilters, getAllFollowUpVisits, getAllTransientAddresses, checkPatientExistsGet, getChildData, getAppointmentsByResidentId } from "./get";
import { api2 } from "@/api/api";

export const useChildData = (id: any,) => {
	return useQuery({
		queryKey: ['childData', id],
		queryFn: () => getChildData(id),
		staleTime: 300000, // 5 minutes
		enabled: !!id,
	})
}

// resident query keys
export const residentQueryKey = {
	allResidents: ["residents"],
	lists: () => [...residentQueryKey.allResidents, "list"],
	list: (filters: any) => [...residentQueryKey.lists(), { filters }],
	details: () => [...residentQueryKey.allResidents, "detail"],
	detail: (id:any) => [residentQueryKey.details(), id],
	search: (params:any) => [...residentQueryKey.allResidents, "search", params]  
}

export const useResidents = (options = {}) => {
	 return useQuery({
		  queryKey: residentQueryKey.lists(),
		  queryFn: getResident,
		  staleTime: 60 * 3,
		  retry: 3,
		  ...options
	 })
}

// patient query keys
export const patientQueryKey = {
	allPatients: ["patients"],
	lists: () => [...patientQueryKey.allPatients, "list"],
	list: (filters: any) => [...patientQueryKey.lists(), { filters }],
	details: () => [...patientQueryKey.allPatients, "detail"],
	detail: (id:any) => [patientQueryKey.details(), id],
	search: (params:any) => [...patientQueryKey.allPatients, "search", params]  
}

export const usePatients = (options = {}) => {
	return useQuery({
		queryKey: patientQueryKey.lists(),
		queryFn: getPatients,
		staleTime: 30 * 1,
		retry: 3,
		...options
	})
}

// patient details query
export const usePatientDetails = (patientId: string, options = {}) => {
	return useQuery({
		queryKey: patientQueryKey.detail(patientId),
		queryFn: () => getPatientDetails(patientId),
		staleTime: 30 * 1,
		retry: 3,
		enabled: !!patientId,
		...options,
	})
}


// follow-up visit query keys
export const followUpVisitQueryKey = {
  allFollowUpVisits: ["followUpVisits"],
  lists: () => [...followUpVisitQueryKey.allFollowUpVisits, "list"],
}

export const useAllFollowUpVisits = (filters: AppointmentFilters, options = {}) => {
  return useQuery({
    queryKey: ['followUpVisits', filters],
    queryFn: () => getAllFollowUpVisits(filters),
    staleTime: 60 * 2,
    retry: 3,
	placeholderData: keepPreviousData,
    ...options,
  })
}

export const appointmentQueryKey = {
  allAppointments: ["appointments"],
  byResidentId: (rp_id: string) => [...appointmentQueryKey.allAppointments, "byResident", rp_id]
};

// Define the proper interface
export interface CombinedAppointmentsResponse {
  follow_up_appointments: any[];
  med_consult_appointments: any[];
  prenatal_appointments: any[];
}

// Create a default empty response
const defaultAppointmentsResponse: CombinedAppointmentsResponse = {
  follow_up_appointments: [],
  med_consult_appointments: [],
  prenatal_appointments: []
};

export const useAppointmentsByResidentId = (rp_id: string) => {
  return useQuery({
    queryKey: ['appointments', rp_id],
    queryFn: async (): Promise<CombinedAppointmentsResponse> => {
      if (!rp_id) {
        return defaultAppointmentsResponse;
      }
      
      try {
        const response = await api2.get(`/patientrecords/appointments/by-resident/${rp_id}/`);
        // Ensure the response has the expected structure
        return {
          follow_up_appointments: response.data?.follow_up_appointments || [],
          med_consult_appointments: response.data?.med_consult_appointments || [],
          prenatal_appointments: response.data?.prenatal_appointments || []
        };
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return defaultAppointmentsResponse;
      }
    },
    enabled: !!rp_id,
  });
};

// transient address query keys
export const transientAddressQueryKey = {
	allTransientAddresses: ["transientAddresses"],
	lists: () => [...transientAddressQueryKey.allTransientAddresses, "list"],
}

export const useAllTransientAddresses = (options = []) => {
	return useQuery({
		queryKey: transientAddressQueryKey.lists(),
		queryFn: getAllTransientAddresses,
		staleTime: 60 * 3,
		retry: 3,
		... options,
	})
}

export const useCheckPatientExists = (rp_id: string) => {
	return useQuery({
		queryKey: ['checkPatientExists', rp_id],
		queryFn: () => checkPatientExistsGet(rp_id),
		staleTime: 300000, // 5 minutes
	})
}