import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteFamilyComposition } from "../restful-api/profilingDeleteAPI"
import { api } from "@/api/api";

export const useDeleteSitio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sitio_id: string) => {
      try {
        const res = await api.delete(`profiling/sitio/${sitio_id}/delete/`);
        return res.status;
      } catch (err) {
        console.error(err)
        throw err;
      }
    }, 
    onSuccess: (_, sitio_id) => { 
      queryClient.setQueryData(["sitioList"], (old: any[] = []) => 
        old.filter((sitio) => sitio.sitio_id !== sitio_id)
      )
      queryClient.invalidateQueries({ queryKey: ["sitioList"] })
    }
  })
}

export const useDeleteRequest = () => {
  return useMutation({
    mutationFn: async (requestId: string) => {
      try {
        const res = await api.delete(`profiling/request/delete/${requestId}/`);
        return res;
      } catch (err) {
        console.error(err);
      }
    }
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