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

export const useDeleteSitio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sitio_id: string) => {
      try {
        const res = await api.delete(`profiling/sitio/${sitio_id}/delete/`);
        return res.status;
      } catch (err) {
        console.error(err)
        throw err;
      }
    }, 
    onSuccess: (_, sitio_id) => { 
      queryClient.setQueryData(["sitioList"], (old: any[] = []) => 
        old.filter((sitio:any) => sitio.sitio_id !== sitio_id)
      )
      queryClient.invalidateQueries({ queryKey: ["sitioList"] })
    }
  })
}