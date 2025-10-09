import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updatePARequestApprove, updatePARequestReject } from "../restful-api/maternalPUT";

export const useUpdatePARequestApprove = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: updatePARequestApprove,
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["prenatalAppointmentRequests"] });
      },
      onError: () => {
         console.error("Error approving prenatal appointment request");
      }
   });
};


export const useUpdatePARequestReject = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({ parId, reason }: { parId: number; reason: string }) => 
         updatePARequestReject(parId, reason),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["prenatalAppointmentRequests"] });
      },
      onError: () => {
         console.error("Error rejecting prenatal appointment request");
      }
   });
};