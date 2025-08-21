import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addAddress,
  addBusiness,
  addBusinessFile,
  addFamily,
  addFamilyComposition,
  addHousehold,
  addPersonal,
  addPersonalAddress,
  addResidentAndPersonal,
} from "../restful-api/profiingPostAPI";
import { api } from "@/api/api";

export const useAddPersonal = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>) => addPersonal(data),
    onSuccess: () => {}
  })
}

export const useAddAddress = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addAddress(data)
  })
}

export const useAddPerAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({data, staff_id, history_id} : {
      data: Record<string, any>[], 
      staff_id?: string,
      history_id?: string
    }) => addPersonalAddress(data, staff_id, history_id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['personalInfo']})
      queryClient.invalidateQueries({queryKey: ['personalHistory']});
    }
  })
}

export const useAddResidentAndPersonal = () => { // For registration from the web
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({personalInfo, staffId} : {
      personalInfo: Record<string, any>;
      staffId: string;
    }) => addResidentAndPersonal(personalInfo, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['residentsTableData'],
      });
    }
  })
}

export const useAddFamily = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({demographicInfo, staffId}: {
      demographicInfo: Record<string, string>;
      staffId: string;
    }) => addFamily(demographicInfo, staffId),
    onSuccess: async (newData) => {
      queryClient.setQueryData(["families"], (old: any[] = []) => [
        ...old,
        newData,
      ]);

      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });
};

export const useAddFamilyComposition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addFamilyComposition(data),
    onSuccess: (data, variables) => {
      const { familyId } = variables[0];
      queryClient.setQueryData(['familyMembers', familyId], (old: any) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: [
            ...old.results,
            ...(Array.isArray(data) ? data : [data])
          ]
        };
      });
      queryClient.invalidateQueries({ queryKey: ['familyMembers', familyId] });
      queryClient.invalidateQueries({ queryKey: ['residents'] });
    }
  });
};

export const useAddHousehold = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      householdInfo,
      staffId,
    }: {
      householdInfo: Record<string, string>;
      staffId: string;
    }) => addHousehold(householdInfo, staffId),
    onSuccess: (newData) => {
      queryClient.setQueryData(["households"], (old: any[] = []) => [
        ...old,
        newData,
      ]);

      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
  });
};

export const useAddBusinessRespondent = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post('profiling/business/create-respondent/', data);
        return res.data;
      } catch (err ) {
        throw err;
      }
    }
  })
}

export const useAddBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => addBusiness(data),
    onSuccess: (newData) => {
      queryClient.setQueryData(["businesses"], (old: any[] = []) => [
        ...old,
        newData
      ]);
      queryClient.invalidateQueries({queryKey: ["businesses"]});
    },
  });
};


export const useAddBusinessFile = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addBusinessFile(data),
  })
}