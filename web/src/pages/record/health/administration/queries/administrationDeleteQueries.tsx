import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAssignedFeatureHealth, deletePositionHealth } from "../restful-api/administrationDeleteAPI";
import { api2 } from "@/api/api";

// Deleting
export const useDeletePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePositionHealth,
    onSuccess: (_, positionId) => {
      queryClient.setQueryData(["positionsHealth"], (old: any[] = []) =>
        old.filter((position) => position.pos_id !== positionId)
      );
    },
  });
};

export const useDeleteAssignedFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({positionId, featureId} : {
      positionId: string,
      featureId: string
    }) => deleteAssignedFeatureHealth(positionId, featureId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allAssignedFeaturesHealth']})
  })
}

export const useDeleteStaffHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffId: string) => {
      try {
        const res = await api2.delete(`administration/staff/${staffId}/delete/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (_, staffId) => {
      queryClient.setQueryData(["staffsHealth"], (old: any[] = []) => 
        old.filter((staff) => staff.staff_id !== staffId)
      )
    }
  })
}
