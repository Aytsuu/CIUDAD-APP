import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchPermissionUpdateHealth, updatePermissionHealth, updatePositionHealth } from "../restful-api/administrationPutAPI";
import { toast } from "sonner";
import { CircleCheck, CircleAlert } from "lucide-react";
import { useNavigate } from "react-router";
import { api2 } from "@/api/api";

// Updating
export const useEditPositionHealth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ positionId, values } : {
      positionId: string;
      values: Record<string, string>
    }) => updatePositionHealth(positionId, values),
    onSuccess: (updatedPosition) => {
      // Final update with actual server data
      queryClient.setQueryData(['positionsHealth'], (old: any[] = []) => 
        old.map(position => 
          position.pos_id === updatedPosition.pos_id 
            ? updatedPosition 
            : position
        )
      );
      toast("Changes saved", {
        icon: (
          <CircleCheck size={24} className="fill-green-500 stroke-white" />
        )
      })
      navigate(-1)
    },
    onError: () => {
      toast("Failed to update position. Please try again.", {
      icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
      });
    } 
  })
}

export const useUpdatePermissionHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({assignmentId, option, permission} : {
      assignmentId: string,
      option: string,
      permission: boolean
    }) => updatePermissionHealth(assignmentId, option, permission),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['allAssignedFeaturesHealth']})
  })
}

export const useBatchPermissionUpdateHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({assignmentId, checked} : {
      assignmentId: string,
      checked: boolean
    }) => batchPermissionUpdateHealth(assignmentId, checked),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['allAssignedFeaturesHealth']})
  })
}

export const useUpdateStaffHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({ 
    mutationFn: async ({data, staffId} : {
      data: Record<string, any>;
      staffId: string;
    }) => {
      try {
        const res = await api2.put(`administration/staff/${staffId}/update/`, data)
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['staffsHealth']})
    }
  })
}
