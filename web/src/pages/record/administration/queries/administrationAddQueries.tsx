import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPosition, addStaff, assignFeature, setPermission } from "../restful-api/administrationPostAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";

// Adding
export const useAddPosition = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, staffId }: { data: any; staffId: string }) =>
      addPosition(data, staffId),
    onSuccess: (newPosition) => {
      queryClient.setQueryData(["positions"], (old: any[] = []) => [
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

export const useAssignFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({positionId, featureId, staffId} : {
      positionId: string;
      featureId: string;
      staffId: string;
    }) => assignFeature(positionId, featureId, staffId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['allAssignedFeatures']})
  })
}

export const useSetPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({assi_id} : {assi_id: string}) => setPermission(assi_id),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['allAssignedFeatures']})
  })
}

export const useAddStaff = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({residentId, positionId, staffId} : {
      residentId: string;
      positionId: string;
      staffId: string;
    }) => addStaff(residentId, positionId, staffId),
    onSuccess: (newData) => {

      if(!newData) return;
      
      queryClient.setQueryData(["staffs"], (old: any[] = []) => [ 
        ...old,
        newData,
      ]);

      queryClient.invalidateQueries({queryKey: ['staffs']})

      // Deliver feedback
      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });

      navigate(-1)
    }
  });
}