import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { string, z } from "zod";
import { updateFamily, updateProfile } from "../restful-api/profilingPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import React from "react";
import { Type } from "../profilingEnums";
import { capitalize } from "@/helpers/capitalize";

export const useUpdateProfile = (
  values: z.infer<typeof personalInfoSchema>,
  setFormType: React.Dispatch<React.SetStateAction<Type>>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ personalId }: { personalId: string }) =>
      updateProfile(personalId, values),
    onSuccess: () => {
      toast("Record updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
      });
      
      setFormType(Type.Viewing);
    }
  });
};

export const useUpdateFamily = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({demographicInfo, familyId} : {
      demographicInfo: Record<string, any>;
      familyId: string;
    }) => updateFamily(demographicInfo, familyId),
    onSuccess: (newData, variables) => {
      const { demographicInfo, familyId } = variables;

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
