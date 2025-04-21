import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateFamily, updateProfile } from "../restful-api/profilingPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { capitalize } from "@/helpers/capitalize";

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: ({ personalId, values}: { 
      personalId: string;
      values: z.infer<typeof personalInfoSchema>;
    }) =>
      updateProfile(personalId, values),
  });
};

export const useUpdateFamily = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({demographicInfo, familyId} : {
      demographicInfo: Record<string, any>;
      familyId: string;
      oldHouseholdId: string;
    }) => updateFamily(demographicInfo, familyId),
    onSuccess: (newData, variables) => {
      const { demographicInfo, familyId, oldHouseholdId} = variables;

      // Update families list
      queryClient.setQueryData(['families'], (old: any[] = []) => (
        old.map(family => {
          if(family.fam_id === familyId) {
            return {
              ...(family || []),
              fam_building: capitalize(demographicInfo.building),
              fam_indigenous: capitalize(demographicInfo.indigenous),
              hh: {
                ...family.hh,
                hh_id: demographicInfo.householdNo
              }
            }
          }
          return family
        })
      ))

      queryClient.setQueryData(['households'], (old: any[] = []) => (
        old.map(house => {
          // Remove the family from previous household
          if(house.hh_id === oldHouseholdId) {
            return {
              ...(house || []),
              family: house.family.filter((fam: any) => (
                fam.fam_id !== familyId
              ))
            }
          }

          // Transfer to new household
          if(house.hh_id === demographicInfo.householdNo) { 
            return {
              ...(house || []),
              family: [
                ...(house.family || []),
                newData
              ]
            }
          }
          return house;
        })
      ))

      queryClient.invalidateQueries({queryKey: ['households']});
      queryClient.invalidateQueries({queryKey: ['families']});

      toast("Record updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
      });
    }
  })
}
