import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { 
	getResident, 
	getPatientDetails, 
	getAllTransientAddresses,
	getChildData,
	checkPatientExistsGet,
	getChildren,
	getPatientCount
 } from "../restful-api/get";


export const usePatientCount = () => {
	return useQuery({
		queryKey: ['patientCount'],
		queryFn: getPatientCount,
		staleTime: 60000, // 1 minute
		refetchInterval: 3000, // 
	})
}

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

export const usePatients = (page: number, pageSize: number, searchQuery: string, status: string) => {
	const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';
	const shouldSendStatus = normalizedStatus && normalizedStatus !== 'all';

	return useQuery({
		queryKey: ['patients', page, pageSize, searchQuery, shouldSendStatus ? normalizedStatus : 'all'],
		queryFn: async () => {
			try {
				const res = await api2.get("/patientrecords/patient/view/create/", {
					params: {
						page,
						page_size: pageSize,
						search: searchQuery,
						status: status
					}
				});
				return res.data;
			} catch (error) {
				throw error;
			}
		},
		staleTime: 5000,
		retry: 1,
		refetchInterval: 5000
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


// follow-up visits query for searching, pagination, and filtering
export const useAllFollowUpVisits = (page: number, pageSize: number, searchcQuery: string, status: string, time_frame: string) => {
	return useQuery({
		queryKey: ['followUpVisits', page, pageSize, searchcQuery, status, time_frame],
		queryFn: async () => {
			try {
				const res = await api2.get("patientrecords/follow-up-visits-all/", {
					params: {
						page,
						page_size: pageSize,
						search: searchcQuery,
						status: status !== 'All' ? status : undefined,
						time_frame: time_frame !== 'All' ? time_frame : undefined
					}
				});
				return res.data;
			} catch (error) {
				throw error;
			}
		},
		staleTime: 5000,
		retry: 1,
		refetchInterval: 50000
	})
}


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

export const useGetChildren = (patientId: string) => {
	return useQuery({
		queryKey: ['getchildren', patientId],
		queryFn: () => getChildren(patientId),
		staleTime: 300000, // 5 minutes
		enabled: !!patientId,
	})
}


