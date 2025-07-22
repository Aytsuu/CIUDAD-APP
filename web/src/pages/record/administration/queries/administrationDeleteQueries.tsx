import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAssignedFeature, deletePosition } from "../restful-api/administrationDeleteAPI";
import { api } from "@/api/api";
import { deleteAssignedFeatureHealth, deletePositionHealth } from "../restful-api/administrationDeleteAPI";
import { api2 } from "@/api/api";
import { toast } from "sonner";
import { CircleAlert, CircleCheck, X } from "lucide-react";

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

//----------------Health Administration Delete Queries------------------

// Deleting
export const useDeletePositionHealth = () => {
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

export const useDeleteAssignedFeatureHealth = () => {
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
