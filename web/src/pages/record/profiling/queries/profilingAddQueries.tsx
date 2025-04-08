import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addPersonal,
  addResidentProfile,
} from "../restful-api/profiingPostAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { Type } from "../profilingEnums";
import { useDeleteRequest } from "./profilingDeleteQueries";
import { z } from "zod";
import { personalInfoSchema } from "@/form-schema/profiling-schema";

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
        newData
      ]);

      queryClient.invalidateQueries({queryKey: ["residents"]});

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

export const useAddPersonal = (values: z.infer<typeof personalInfoSchema>) => {
  return useMutation({
    mutationFn: () => addPersonal(values)
  });
};
