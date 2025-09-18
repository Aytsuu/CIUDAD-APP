import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { resolveCase, escalateCase, acceptSummonRequest, rejectSummonRequest } from "../requestAPI/summonPutAPI";

export const useResolveCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
        mutationFn: (sr_id: string) => resolveCase(sr_id),
        onMutate: () =>{
            toast.loading("Marking case...", { id: "resolveCase" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serviceChargeDetails'] })
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
            toast.success('Case marked as resolved', {
                id: "resolveCase",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in marking case:", err);
            toast.error("Failed to mark case.", {
            id: "resolveCase",
            duration: 2000
            });
        }
    })
}

export const useEscalateCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
       mutationFn: ({ srId, comp_id }: { srId: string, comp_id: string }) =>escalateCase(srId, comp_id),
        onMutate: () =>{
            toast.loading("Marking case...", { id: "escalateCase" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serviceChargeDetails'] })
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
            toast.success('Case marked as escalated', {
                id: "escalateCase",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in marking case:", err);
            toast.error("Failed to mark case.", {
            id: "escalateCase",
            duration: 2000
            });
        }
    })
}


// export const useUpdateSuppDoc = (onSuccess?: () => void) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data: {
//       csd_id: string;
//       values: {
//         description: string;
//         supp_doc: string;
//       };
//       mediaFiles: MediaUploadType;
//     }) => updateSuppDoc({
//       csd_id: String(data.csd_id),
//       description: data.values.description,
//       media: data.mediaFiles[0] // Pass the first media file
//     }),
//     onMutate: () => {
//       toast.loading("Updating document...", { id: "updateSuppDoc" });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['caseDetails'] });
//       queryClient.invalidateQueries({ queryKey: ['suppDocs'] });
      
//       toast.success('Document Updated!', {
//         id: "updateSuppDoc",
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 2000
//       });
      
//       onSuccess?.();
//     },
//     onError: (err) => {
//       console.error("Error in updating document:", err);
//       toast.error("Failed to update document.", {
//         id: "updateSuppDoc",
//         duration: 2000
//       });
//     }
//   });
// };

export const useAcceptRequest = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
        mutationFn: (sr_id: string) => acceptSummonRequest(sr_id),
        onMutate: () =>{
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonPendingReq'] })
            queryClient.invalidateQueries({ queryKey: ['summonAcceptedReq'] })

            toast.success('Request Accepted', {
                id: "acceptReq",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in accepting request:", err);
            toast.error("Failed to accept request.", {
            id: "acceptReq",
            duration: 2000
            });
        }
    })
}


export const useRejectRequest = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
        mutationFn: (values: {sr_id: string, reason: string}) => rejectSummonRequest(values.sr_id, values.reason),
        onMutate: () =>{
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonPendingReq'] })
            queryClient.invalidateQueries({ queryKey: ['summonRejectedReq'] })
            toast.success('Request Rejected', {
                id: "rejectReq",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in rejecting request:", err);
            toast.error("Failed to reject request.", {
            id: "rejectReq",
            duration: 2000
            });
        }
    })
}

