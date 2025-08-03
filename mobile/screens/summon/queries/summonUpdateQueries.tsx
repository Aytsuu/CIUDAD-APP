import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { resolveCase, escalateCase} from "../requestAPI/summonPutAPI";
// import type { MediaUploadType } from "@/components/ui/media-upload";

export const useResolveCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext();

     return useMutation({
        mutationFn: (sr_id: string) => resolveCase(sr_id),
  
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
            toast.success('Case marked as resolved')
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in marking case:", err);
            toast.error("Failed to mark case.")
        }
    })
}

export const useEscalateCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext();

     return useMutation({
        mutationFn: ({ srId, comp_id }: { srId: string, comp_id: string }) =>escalateCase(srId, comp_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
            toast.success('Case marked as escalated')
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in marking case:", err);
            toast.error("Failed to mark case.")
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

