"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
	addScheduler, 
	addService,
	addDay
 } from "../restful-api/schedulerPostAPI";
import { toast } from "sonner";

import { CircleCheck } from "lucide-react";


export const useAddService = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: addService,
		onSuccess: (service) => {
			queryClient.invalidateQueries({
				queryKey: ['services']
			})

			toast("New service created successfully", {
				icon: (
					<CircleCheck size={24} className="fill-green-500 stroke-white" />
				),	
			});
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

	return useMutation({
		mutationFn: addDay,
		onSuccess: (day) => {
			queryClient.invalidateQueries({
				queryKey: ['days']
			}),
			toast("New day created successfully", {
				icon: (
					<CircleCheck size={24} className="fill-green-500 stroke-white" />
				),	
			});
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

	return useMutation({
		mutationFn: addScheduler,
		onSuccess: (ss_id) => {
			queryClient.invalidateQueries({
				queryKey: ['schedulers']
			})

			toast("New schedule created successfully", {
				icon: (
					<CircleCheck size={24} className="fill-green-500 stroke-white" />
				),	
			});
			console.log("Successfully added scheduler ID: ", ss_id)
		},
		onError: (error: Error) => {
			console.error('Scheduler error: ', error.message)
		}
	})
}