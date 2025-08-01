import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAssignedFeature, deletePosition } from "../restful-api/administrationDeleteAPI";
import { api } from "@/api/api";

// Deleting
export const useDeletePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePosition,
    onSuccess: (_, positionId) => {
      queryClient.setQueryData(["positions"], (old: any[] = []) =>
        old.filter((position) => position.pos_id !== positionId)
      );
    }
  });
};

export const useDeleteAssignedFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({positionId, featureId} : {
      positionId: string,
      featureId: string
    }) => deleteAssignedFeature(positionId, featureId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allAssignedFeatures']})
  })
}

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffId: string) => {
      try {
        const res = await api.delete(`administration/staff/${staffId}/delete/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (_, staffId) => {
      queryClient.setQueryData(["staffs"], (old: any[] = []) => 
        old.filter((staff) => staff.staff_id !== staffId)
      )
    }
  })
}
