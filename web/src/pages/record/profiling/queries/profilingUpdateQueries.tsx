import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBusiness, updateFamily, updateFamilyRole, updateHousehold, updateProfile } from "../restful-api/profilingPutAPI";
import { api } from "@/api/api";

export const useUpdateHousehold = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdInfo: Record<string, any>) => updateHousehold(householdInfo), 
    onSuccess: (data) => {
      queryClient.setQueryData(['householdData'], (old: any) => {
        if (!old) return data; // If no cache, just set the new data
        if (old.hh_id === data.hh_id) {
          return {
            ...old,
            head: data.head,
            hh_nhts: data.hh_nhts,
            // Optionally spread all of data if you want to update more fields:
            // ...data
          };
        }
        return old;
      });
      // queryClient.invalidateQueries({queryKey: ['householdData']});
      // queryClient.invalidateQueries({queryKey: ['households']});
    }
  })
}

export const useUpdateFamilyRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ familyId, residentId, fc_role } : {
      familyId: string;
      residentId: string;
      fc_role: string | null;
    }) => updateFamilyRole(familyId, residentId, fc_role),
    onSuccess: (_,variables) => {
      const {familyId, residentId, fc_role} = variables;

      queryClient.setQueryData(['familyMembers', familyId], (old: any) => ({
        ...old,
        results: old.results?.map((member: any) => {
          console.log(member.rp_id, residentId)
          if(member.rp_id == residentId) {
            return {
              ...member,
              fc_role: fc_role
            }
          }
          return member
        })
      }))
      queryClient.invalidateQueries({ queryKey: ['familyMembers', familyId]})
    }
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ personalId, values} : { 
      personalId: string;
      values: Record<string, any>;
    }) => updateProfile(personalId, values),
    onSuccess: (variables) => {
      const { per_id } = variables;
      queryClient.invalidateQueries({queryKey: ['personalInfo', per_id]});
      queryClient.invalidateQueries({queryKey: ['personalHistory', per_id]});
    }
  });
};

export const useUpdateFamily = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({data, familyId} : {
      data: Record<string, any>;
      familyId: string;
    }) => updateFamily(data, familyId),
    onSuccess: (_, variables) => {
      const { data, familyId } = variables;

      // Update families list
      queryClient.setQueryData(['familyData', familyId], (old: any) => ({
        ...old,
        fam_building: data.fam_building,
        fam_indigenous: data.fam_indigenous,
        household_no: data.hh
      }))

      queryClient.invalidateQueries({queryKey: ['familiesTableData']});
    }
  })
}

export const useUpdateBusiness = () => {
  const queryclient = useQueryClient();
  return useMutation({
    mutationFn: ({data, businessId} : {
      data: Record<string, any>;
      businessId: string;
    }) => updateBusiness(data, businessId),
    onSuccess: (newData) => {
      console.log(newData)
      queryclient.setQueryData(['businessInfo'], (old: any) => ({
        ...(old || {}),
        ...newData
      }));

      queryclient.invalidateQueries({queryKey: ['activeBusinesses']});
      queryclient.invalidateQueries({queryKey: ['pendingBusinesses']});
      queryclient.invalidateQueries({queryKey: ['businessInfo']});
    }
  })
}

export const useUpdateBusinessModification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({data, bm_id}:{
      data: Record<string, any>
      bm_id: string
    }) => {
      try {
        const res = await api.patch(`profiling/business/modification/${bm_id}/result/`, data);
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }, 
    onSuccess: (_, variables) => {
      const { bm_id } = variables
      queryClient.setQueryData(['modificationRequests'], (old: any[] = []) => 
        old.filter((req: any) => req.bm_id != bm_id)
      )
      queryClient.invalidateQueries({queryKey: ['businessHistory']})
    }
  })
}


export const useUpdateAccount = () => {
  return useMutation({
    mutationFn: async ({accNo, data} : {
        accNo: number, 
        data: Record<string, any>
      }) => {
      try {
        const res = await api.put(`account/${accNo}/`, data);
        return res.data
      } catch (err) {
        throw err;
      }
    }
  })
}
