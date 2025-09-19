import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	addScheduler,
	addService,
	addDay
} from "../restful-api/schedulerPostAPI";
import { useToastContext } from "@/components/ui/toast"
import { queryClient } from "@/lib/queryClient";


export const useAddService = () => {
	const { toast } = useToastContext();
	return useMutation({
		mutationFn: addService,
		onSuccess: (service) => {
			queryClient.invalidateQueries({
				queryKey: ['services']
			})

			toast.success("New service created successfully");
			console.log("Successfully added service ID: ", service)
		},
		onError: (error: Error) => {
			console.error('Service error: ', error.message)
			toast.error("Failed to create service. Please try again.")
		}
	})
}

export const useAddDay = () => {
	const queryClient = useQueryClient();
	const { toast } = useToastContext();
	return useMutation({
		mutationFn: addDay,
		onSuccess: (day) => {
			queryClient.invalidateQueries({
				queryKey: ['days']
			}),
				toast.success("New day created successfully");
			console.log("Successfully added day ID: ", day)
		},
		onError: (error: Error) => {
			console.error('Day error: ', error.message)
			toast.error("Failed to create day. Please try again.")
		}
	})
}

export const useAddScheduler = () => {
	const queryClient = useQueryClient();
	const { toast } = useToastContext();
	return useMutation({
		mutationFn: addScheduler,
		onSuccess: (ss_id) => {
			queryClient.invalidateQueries({
				queryKey: ['schedulers']
			})

			toast.success("New schedule created successfully");
			console.log("Successfully added scheduler ID: ", ss_id)
		},
		onError: (error: Error) => {
			console.error('Scheduler error: ', error.message)
		}
	})
}