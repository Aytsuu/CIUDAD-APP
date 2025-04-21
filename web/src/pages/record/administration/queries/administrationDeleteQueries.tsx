import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAssignedFeature, deletePosition } from "../restful-api/administrationDeleteAPI";

// Deleting
export const useDeletePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePosition,
    onSuccess: (_, positionId) => {
      queryClient.setQueryData(["positions"], (old: any[] = []) =>
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
    }) => deleteAssignedFeature(positionId, featureId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allAssignedFeatures']})
  })
}
