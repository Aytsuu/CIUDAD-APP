import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteFamilyComposition, deleteRequest } from "../restful-api/profilingDeleteAPI"

export const useDeleteRequest = () => {
  return useMutation({
    mutationFn: (requestId: string) => deleteRequest(requestId)
  })
}

export const useDeleteFamilyComposition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({familyId, residentId} : {
      familyId: string
      residentId: string
    }) => deleteFamilyComposition(familyId, residentId),
    onSuccess: (_, variables) => {
      const {familyId, residentId} = variables;

      queryClient.setQueryData(['families'], (old: any[] = []) => {
        return old.map(family => {
          if (family.fam_id === familyId) {
            return {
              ...family,
              family_compositions: family.family_compositions.filter(
                (fc: any) => fc.rp.rp_id !== residentId
              )
            };
          }
          return family;
        });
      });

      // Update the resident if needed (remove the family connection)
      queryClient.setQueryData(['residents'], (old: any[] = []) => {
        return old.map(resident => {
          if(resident.rp_id === residentId) {
            return {
              ...resident,
              family_compositions: []
            }
          }
          return resident;
        })
      });

      queryClient.invalidateQueries({queryKey: ['familyCompositions']});
      queryClient.invalidateQueries({queryKey: ['families']});
      queryClient.invalidateQueries({queryKey: ['residents']});
    }
  })
}