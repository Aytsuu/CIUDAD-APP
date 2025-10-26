import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteService, deleteDay } from "../restful-api/schedulerDeleteAPI";
import { useToastContext } from "@/components/ui/toast"

export const useDeleteService = () => {
	const { toast } = useToastContext();
	const queryClient = useQueryClient();
	
	return useMutation({
		mutationFn: deleteService,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['services'] });
			queryClient.invalidateQueries({ queryKey: ['schedulers'] });

			toast.success("Service deleted successfully");
		},
		onError: (error) => {
			console.log("Error deleting service:", error);
			toast.error('Failed to delete service. ')
			}});
		}
	


export const useDeleteDay = () => {
	const queryClient = useQueryClient();
	const { toast } = useToastContext();
	return useMutation({
		mutationFn: deleteDay,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['days'] });
			queryClient.invalidateQueries({ queryKey: ['schedulers'] });

			toast.success("Day deleted successfully");
		},
		onError: (error) => {
			console.log("Error deleteing day:", error);
			toast.error('Failed to delete day.');
		}
	})
}
