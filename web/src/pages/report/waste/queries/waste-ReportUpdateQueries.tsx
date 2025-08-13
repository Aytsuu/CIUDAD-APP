import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateWasteReport } from "../request/waste-ReportPutRequest";
import { uploadResolvedImage } from "../request/waste-ReportPutRequest";


type FileData = {
    name: string;
    type: string;
    file?: string;
};


export const useUpdateWasteReport = (rep_id: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: { 
      rep_status: string;
      files: FileData[]; 
    }) => {
      // 1. Update the main report status and date
      await updateWasteReport(rep_id, {
        rep_status: values.rep_status,
      });
      
      console.log("GAWAS SA QUERY: ", values.files)
      // 2. Upload all resolution images
      if (values.files && values.files.length > 0) {
        await Promise.all(
          values.files.map(file => 
            uploadResolvedImage({
              rep_id,
              file_data: {
                name: file.name,
                type: file.type,
                file: file.file
              }
            }).catch(error => {
              console.error("Error creating file entry:", error);
              return null;
            })
          )
        );
      }  
      
      return rep_id;
    },  
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wastereport'] });
      
      toast.loading("Updating report...", { id: "updateWasteReport" });
      
      // Show success toast
      toast.success('Report updated successfully', {
        id: "updateWasteReport",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating waste report:", err);
      toast.error(
        "Failed to update report. Please try again.",
        { duration: 2000 }
      );
    }
  });
};