import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
import { deleteService, deleteDay } from "../restful-api/schedulerDeleteAPI";


export const useDeleteService = () => {
	const queryClient = useQueryClient();
	
	return useMutation({
		mutationFn: deleteService,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['services'] });
			queryClient.invalidateQueries({ queryKey: ['schedulers'] });

			toast.success("Service deleted successfully", {
				icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
			});
		},
		onError: (error) => {
			console.log("Error deleting service:", error);
			toast.error('Failed to delete service. ', {
				icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
			});
		},
	})
}


export const useDeleteDay = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteDay,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['days'] });
			queryClient.invalidateQueries({ queryKey: ['schedulers'] });

			toast.success("Day deleted successfully", {
				icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
			});
		},
		onError: (error) => {
			console.log("Error deleteing day:", error);
			toast.error('Failed to delete day.', {
				icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
			})
		}
	})
}