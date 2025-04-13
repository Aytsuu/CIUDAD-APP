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
      queryClient.setQueryData(["residents"], (old: any[] = []) => [
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
    mutationFn: ({
      familyId,
      role,
      residentId,
    }: {
      familyId: string;
      role: string;
      residentId: string;
    }) => addFamilyComposition(familyId, role, residentId),
    onSuccess: (newData) => {
      queryClient.setQueryData(['familyCompositions'], (old: any[] = []) => [
        ...old,
        newData
      ]);

      queryClient.invalidateQueries({queryKey: ['familyCompositions']});
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
      queryClient.setQueryData(["households"], (old: any[] = []) => [
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
