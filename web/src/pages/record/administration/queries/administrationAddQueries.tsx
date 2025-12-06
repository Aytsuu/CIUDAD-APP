import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addStaff, assignFeature } from "../restful-api/administrationPostAPI";
import { useNavigate } from "react-router";
import { api } from "@/api/api";

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
          const res = await api.post('administration/position/bulk/create/', data)
          return res.data
      } catch(err: any) {
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['positions']});
      queryClient.invalidateQueries({queryKey: ['positionsHealth']});
    }
  })
}

export const useAddSitio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>[]) => {
      try {
        const res = await api.post("profiling/sitio/create/", data);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["sitioList"], (old: any[] = []) => [
        ...old,
        data
      ]);
      queryClient.invalidateQueries({queryKey: ["sitioList"]})
    }
  }) 
}