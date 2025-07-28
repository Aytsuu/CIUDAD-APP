"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addScheduler } from "../restful-api/schedulerPostAPI";
import { toast } from "sonner";

import { CircleCheck } from "lucide-react";


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