import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';

interface UpdateComplaintData {
  comp_status: "Pending" | "Accepted" | "Rejected" | "Raised" | "Cancelled";
  comp_rejection_reason?: string;
  staff_id?: number;
}

interface UpdateComplaintResponse {
  message: string;
  data: any;
}

// API function to update complaint status
export const updateComplaintStatus = async (
  comp_id: number,
  data: UpdateComplaintData
): Promise<UpdateComplaintResponse> => {
  const response = await api.patch(
    `/complaint/${comp_id}/update/`,
    data
  );
  return response.data;
};

// React Query mutation hook
export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comp_id, data }: { comp_id: number; data: UpdateComplaintData }) =>
      updateComplaintStatus(comp_id, data),
    onSuccess: (response) => {
      // Invalidate and refetch complaint lists
      queryClient.invalidateQueries({ queryKey: ['complaint-lists'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', response.data.comp_id] });
    },
    onError: (error: any) => {
      console.error('Error updating complaint:', error);
    },
  });
};
