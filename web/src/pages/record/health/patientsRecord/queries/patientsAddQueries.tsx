import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPatients } from "../restful-api/patientsPostAPI";

// query keys
export const patientQueryKey = {
	allPatients: ["patients"],
	lists: () => [...patientQueryKey.allPatients, "list"],
	list: (filters: any) => [...patientQueryKey.lists(), { filters }],
	details: () => [...patientQueryKey.allPatients, "detail"],
	detail: (id:any) => [patientQueryKey.details(), id],
	search: (params:any) => [...patientQueryKey.allPatients, "search", params]  
}

// export const useAddPatient = () => {
// 	const queryClient = useQueryClient();

// 	return useMutation({
// 		mutationFn: createPatients,
// 		onSuccess: (data) => {
// 			queryClient.invalidateQueries({ queryKey: patientQueryKey.lists() });
// 			queryClient.setQueryData(patientQueryKey.detail(data.pat_id), data)
// 		},
// 		onError: (error) => {
// 			console.error("Error adding patient: ", error)
// 		}
// 	})
// }

export const useAddPatient = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPatients,
		onSuccess: (data) => {
			// Add null check to prevent the TypeError
			if (data && data.pat_id) {
				queryClient.invalidateQueries({ queryKey: patientQueryKey.lists() });
				queryClient.setQueryData(patientQueryKey.detail(data.pat_id), data);
				console.log("Patient created successfully:", data.pat_id);
			} else {
				console.error("Invalid response data:", data);
			}
		},
		onError: (error: unknown) => {
			console.error("Error adding patient:", error);
			if (typeof error === "object" && error !== null && "response" in error) {
				const err = error as { response?: { status?: number } };
				if (err.response?.status === 500) {
					console.log("Refreshing patient list due to potential creation despite error");
					queryClient.invalidateQueries({ queryKey: patientQueryKey.lists() });
				}
			}
		}
	})
}