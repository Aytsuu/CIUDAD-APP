// administrationQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addPosition } from "../restful-api/administrationPostAPI";
import { deletePosition } from "../restful-api/administrationDeleteAPI";
import { getResidents } from "../../profiling/restful-api/profilingGetAPI";
import { updatePosition } from "../restful-api/administrationPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import {
  getFeatures,
  getPositions,
  getStaffs,
  getAllAssignedFeatures,
} from "../restful-api/administrationGetAPI";

// Fetching
export const useResidents = () => {
  return useQuery({
    queryKey: ["residents"],
    queryFn: getResidents,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useStaffs = () => {
  return useQuery({
    queryKey: ["staffs"],
    queryFn: getStaffs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePositions = () => {
  return useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFeatures = () => {
  return useQuery({
    queryKey: ["features"],
    queryFn: getFeatures,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAllAssignedFeatures = () => {
  return useQuery({
    queryKey: ["allAssignedFeatures"],
    queryFn: getAllAssignedFeatures,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
1;

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
        icon: (
          <CircleCheck size={24} className="fill-green-500 stroke-white" />
        ),
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
    },
  });
};

// Updating
export const useEditPosition = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ positionId, values } : {
      positionId: string;
      values: Record<string, string>
    }) => updatePosition(positionId, values),
    onSuccess: (updatedPosition) => {
      // Final update with actual server data
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
    } 
  })
}

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
