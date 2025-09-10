import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPosition, addStaff, assignFeature, setPermission } from "../restful-api/administrationPostAPI";
import { useNavigate } from "react-router";
import { api } from "@/api/api";
import { api2 } from "@/api/api";

// Adding
export const useAddPosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, staffId }: { data: any; staffId: string }) =>
      addPosition(data, staffId),
    onSuccess: (newPosition) => {
      queryClient.setQueryData(["positions"], (old: any[] = []) => [
        ...old,
        newPosition,
      ]);
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
    onSuccess: (data) => {
      queryClient.setQueryData(['allAssignedFeatures'], (old: any[] = []) => [
        ...old,
        data
      ])
      queryClient.invalidateQueries({queryKey: ['allAssignedFeatures']})
    }
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
    mutationFn: ({residentId, positionId, staffId, staffType} : {
      residentId: string;
      positionId: string;
      staffId: string;
      staffType: string;
    }) => addStaff(residentId, positionId, staffId, staffType),
    onSuccess: (newData) => {

      if(!newData) return;
      
      queryClient.setQueryData(["staffs"], (old: any[] = []) => [ 
        ...old,
        newData,
      ]);

      queryClient.invalidateQueries({queryKey: ['staffs']})

      navigate(-1)
    }
  });
}

export const useAddPositionBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        console.log('Payload being sent to bulk create:', data);
        
        // Call both APIs
        const [res1, res2] = await Promise.all([
          api.post('administration/position/bulk/create/', data),
          api2.post('administration/position/bulk/create/', data)
        ]);
        
        return {
          api1Response: res1.data,
          api2Response: res2.data
        };
      } catch(err: any) {
        console.error('Bulk position creation error:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['positions']});
      queryClient.invalidateQueries({queryKey: ['positionsHealth']});
    }
  })
}
