import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { Type } from "../profilingEnums";
import { useDeleteRequest } from "./profilingDeleteQueries";
import { z } from "zod";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import {
  addBusiness,
  addBusinessFile,
  addFamily,
  addFamilyComposition,
  addFile,
  addHousehold,
  addPersonal,
  addResidentProfile,
} from "../restful-api/profiingPostAPI";

export const useAddPersonal = (values: z.infer<typeof personalInfoSchema>) => {
  return useMutation({
    mutationFn: () => addPersonal(values),
  });
};

export const useAddResidentProfile = (params: any) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteRequest } = useDeleteRequest();
  return useMutation({
    mutationFn: ({
      personalId,
      staffId,
    }: {
      personalId: string;
      staffId: string;
    }) => addResidentProfile(personalId, staffId),
    onSuccess: async (newData) => {
      queryClient.setQueryData(["residents"], (old: any) => [
        ...old,
        newData,
      ]);

      queryClient.invalidateQueries({ queryKey: ["residents"] });

      toast("New record created successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });

      // Exit registration page after request has been approved
      if (params.type === Type.Request) {
        await deleteRequest(params.data.req_id);
        navigate(-1);
      }

      navigate("/account/create");
    },
  });
};

export const useAddFamily = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({demographicInfo, staffId}: {
      demographicInfo: Record<string, string>;
      staffId: string;
    }) => addFamily(demographicInfo, staffId),
    onSuccess: async (newData) => {
      queryClient.setQueryData(["families"], (old: any) => [
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
    mutationFn: ({familyId, role, residentId}: {
      familyId: string;
      role: string;
      residentId: string;
    }) => addFamilyComposition(familyId, role, residentId),
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

export const useAddHousehold = () => {
  const navigate = useNavigate();
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

export const useAddBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessInfo,
      staffId,
    }: {
      businessInfo: Record<string, string>;
      staffId: string;
    }) => addBusiness(businessInfo, staffId),
    onSuccess: (newData) => {
      queryClient.setQueryData(["businesses"], (old: any) => [
        ...old,
        newData
      ]);
      queryClient.invalidateQueries({queryKey: ["businesses"]});
    },
  });
};


export const useAddBusinessFile = () => {
  return useMutation({
    mutationFn: ({businessId, fileId} : {
      businessId: string;
      fileId: string;
    }) => addBusinessFile(businessId, fileId),
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
