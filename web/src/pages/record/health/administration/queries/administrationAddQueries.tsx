import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPositionHealth, addStaffHealth, assignFeatureHealth, setPermissionHealth } from "../restful-api/administrationPostAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";

// Adding
export const useAddPositionHealth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, staffId }: { data: any; staffId: string }) =>
      addPositionHealth(data, staffId),
    onSuccess: (newPosition) => {
      queryClient.setQueryData(["positionsHealth"], (old: any[] = []) => [
        ...old,
        newPosition,
      ]);
      toast("New record created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
    },
  });
};

export const useAssignFeatureHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({positionId, featureId, staffId} : {
      positionId: string;
      featureId: string;
      staffId: string;
    }) => assignFeatureHealth(positionId, featureId, staffId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['allAssignedFeaturesHealth']})
  })
}

export const useSetPermissionHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({assi_id} : {assi_id: string}) => setPermissionHealth(assi_id),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['allAssignedFeaturesHealth']})
  })
}

export const useAddStaffHealth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({residentId, positionId, staffId} : {
      residentId: string;
      positionId: string;
      staffId: string;
    }) => addStaffHealth(residentId, positionId, staffId),
    onSuccess: (newData) => {

      if(!newData) return;
      
      queryClient.setQueryData(["staffsHealth"], (old: any[] = []) => [ 
        ...old,
        newData,
      ]);

      queryClient.invalidateQueries({queryKey: ['staffsHealth']})

      // Deliver feedback
      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });

      navigate(-1)
    }
  });
}