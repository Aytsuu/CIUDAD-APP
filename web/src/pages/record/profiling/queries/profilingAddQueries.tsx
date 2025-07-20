import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import {
  addAddress,
  addBusiness,
  addBusinessFile,
  addFamily,
  addFamilyComposition,
  addFile,
  addHousehold,
  addPersonalAddress,
  addResidentAndPersonal,
} from "../restful-api/profiingPostAPI";

export const useAddAddress = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addAddress(data)
  })
}

export const useAddPerAddress = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addPersonalAddress(data)
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
    onSuccess: (newData, variables) => {
      // const {familyId, role, residentId} = variables;

      // // Update family compositions list
      // queryClient.setQueryData(['familyCompositions'], (old: any[] = []) => [...old, newData]);

      // // Update the families list (if you have one)
      // queryClient.setQueryData(['families'], (old: any[] = []) => {
      //   return old.map(family => {
      //     if (family.fam_id === familyId) {
      //       return {
      //         ...family,
      //         family_compositions: [
      //           ...(family.family_compositions || []),
      //           newData
      //         ]
      //       };
      //     }

      //     return family;
      //   });
      // });

      // // Update residents list
      // queryClient.setQueryData(['residents'], (oldResidents: any[] = []) => {
      //   return oldResidents.map(resident => {
      //     if(resident.rp_id === residentId) {
      //       return {
      //         ...resident,
      //         family_compositions: [
      //           ...(resident.family_compositions || []),
      //           { 
      //             fc_role: role, 
      //             fam: { 
      //               fam_id: familyId,
      //               hh: {
      //                 hh_id: newData.fam?.hh?.hh_id,
      //                 sitio: newData.fam?.hh?.sitio
      //               },
      //             } 
      //           },
      //         ],
      //       }
      //     }

      //     return resident
      //   })}
      // );

      
      // Invalidate queries to ensure fresh data is fetched if needed
      queryClient.invalidateQueries({queryKey: ['familyCompositions']});
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({queryKey: ['residents']});
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

      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
    },
  });
};

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

export const useAddFile = () => {
  return useMutation({
    mutationFn: ({name, type, path, url} : {
      name: string;
      type: string;
      path: string;
      url: string
    }) => addFile(name, type, path,url),
  })
}