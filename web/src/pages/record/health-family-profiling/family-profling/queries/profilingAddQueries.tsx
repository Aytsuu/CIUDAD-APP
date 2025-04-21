import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { Type } from "../../profilingEnums";
import { useDeleteRequest } from "./profilingDeleteQueries";
import { z } from "zod";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import {
  addFamilyHealth,
  addFamilyCompositionHealth,
  addHouseholdHealth,
  addPersonalHealth,
  addResidentProfileHealth,
} from "../restful-api/profiingPostAPI";

export const useAddPersonalHealth = (values: z.infer<typeof personalInfoSchema>) => {
  return useMutation({
    mutationFn: () => addPersonalHealth(values),
  });
};

export const useAddResidentProfileHealth = () => {
  
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      personalId,
      staffId,
    }: {
      personalId: string;
      staffId: string;
      params: any
    }) => addResidentProfileHealth(personalId, staffId),
    onSuccess: async (newData) => {
      queryClient.setQueryData(["residents"], (old: any[] = []) => [
        ...old,
        newData
      ]);

      queryClient.invalidateQueries({ queryKey: ["residents"] });
    },
  });
};

export const useAddFamilyHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({demographicInfo, staffId}: {
      demographicInfo: Record<string, string>;
      staffId: string;
    }) => addFamilyHealth(demographicInfo, staffId),
    onSuccess: async (newData) => {
      queryClient.setQueryData(["families"], (old: any) => [
        ...old,
        newData,
      ]);

      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });
};

export const useAddFamilyCompositionHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({familyId, role, residentId}: {
      familyId: string;
      role: string;
      residentId: string;
    }) => addFamilyCompositionHealth(familyId, role, residentId),
    onSuccess: (newData, variables) => {
      const {familyId, role, residentId} = variables;

      // Update family compositions list
      queryClient.setQueryData(['familyCompositions'], (old: any) => [...old, newData]);

      // Update the families list (if you have one)
      queryClient.setQueryData(['families'], (old: any[] = []) => {
        return old.map(family => {
          if (family.fam_id === familyId) {
            return {
              ...family,
              family_compositions: [
                ...(family.family_compositions || []),
                newData
              ]
            };
          }

          return family;
        });
      });

      // Update residents list
      queryClient.setQueryData(['residents'], (oldResidents: any[] = []) => {
        return oldResidents.map(resident => {
          if(resident.rp_id === residentId) {
            return {
              ...resident,
              family_compositions: [
                ...(resident.family_compositions || []),
                { 
                  fc_role: role, 
                  fam: { 
                    fam_id: familyId,
                    hh: {
                      hh_id: newData.fam?.hh?.hh_id,
                      sitio: newData.fam?.hh?.sitio
                    },
                  } 
                },
              ],
            }
          }

          return resident
        })}
      );

      // Invalidate queries to ensure fresh data is fetched if needed
      queryClient.invalidateQueries({queryKey: ['familyCompositions']});
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({queryKey: ['residents']});
    }
  });
};

export const useAddHouseholdHealth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      householdInfo,
      staffId,
    }: {
      householdInfo: Record<string, string>;
      staffId: string;
    }) => addHouseholdHealth(householdInfo, staffId),
    onSuccess: (newData) => {
      queryClient.setQueryData(["households"], (old: any) => [
        ...old,
        newData,
      ]);

      queryClient.invalidateQueries({ queryKey: ["households"] });

      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
    },
  });
};

