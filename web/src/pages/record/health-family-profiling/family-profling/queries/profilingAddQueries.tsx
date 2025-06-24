import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import {
  addAddressHealth,
  addFamilyHealth,
  addFamilyCompositionHealth, 
  addHouseholdHealth,
  addPersonalAddressHealth,
  addResidentAndPersonalHealth,
  addResidentProfileHealth,
} from "../restful-api/profiingPostAPI";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";


export const useAddAddressHealth = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addAddressHealth(data)
  })
}
export const useAddPerAddressHealth = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addPersonalAddressHealth(data)
  })
}
export const useAddResidentProfileHealth = () => { // For registration request
  return useMutation({
    mutationFn: ({
      personalId,
      staffId,
    }: {
      personalId: string;
      staffId: string;
    }) => addResidentProfileHealth(personalId, staffId)
  });
};

export const useAddResidentAndPersonalHealth = () => { // For registration from the web
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({personalInfo, staffId} : {
      personalInfo: Record<string, any>;
      staffId?: string;
    }) => addResidentAndPersonalHealth(personalInfo, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['residentsTableDataHealth'],
      });
    }
  })
}

// export const useAddPersonalHealth = (values: z.infer<typeof personalInfoSchema>) => {
//   return useMutation({
//     mutationFn: () => addPersonalHealth(values),
//   });
// };



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
    mutationFn: (data: Record<string, any>[]) => addFamilyCompositionHealth(data),
    onSuccess: (newData, variables) => {

      // Invalidate queries to ensure fresh data is fetched if needed
      queryClient.invalidateQueries({queryKey: ['familyCompositions']});
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({queryKey: ['residents']});

      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });

      }
  });
};

export const useAddHouseholdHealth = () => {
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
      });
    },
  });
};

