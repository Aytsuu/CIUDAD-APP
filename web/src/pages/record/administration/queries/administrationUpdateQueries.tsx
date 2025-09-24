import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePosition } from "../restful-api/administrationPutAPI";
import { toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "@/api/api";

export const useUpdatePosition = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ positionId, values } : {
      positionId: string;
      values: Record<string, string>
    }) => updatePosition(positionId, values),
    onSuccess: (updatedPosition) => {
      queryClient.setQueryData(['positions'], (old: any[] = []) => 
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

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({ 
    mutationFn: async ({data, staffId} : {
      data: Record<string, any>;
      staffId: string;
    }) => {
      try {
        const res = await api.put(`administration/staff/${staffId}/update/`, data)
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['staffs']})
    }
  })
}

