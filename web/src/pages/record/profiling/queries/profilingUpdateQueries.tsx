import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateProfile } from "../restful-api/profilingPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import React from "react";
import { Type } from "../profilingEnums";

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
