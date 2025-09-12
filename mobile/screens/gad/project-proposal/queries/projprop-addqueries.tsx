import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { addSupportDocument } from "../api/projprop-postreq";
import { MediaItem } from "@/components/ui/media-picker";

interface ValidMediaItem extends MediaItem {
  file: string;
}
const isValidMediaItem = (file: MediaItem): file is ValidMediaItem => {
  return file.file !== undefined && typeof file.file === "string" && file.file.length > 0;
};

export const useAddSupportDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async ({
      gprId,
      files,
    }: {
      gprId: number;
      files: MediaItem[];
    }) => {
      if (!gprId) {
        throw new Error("Project proposal ID is required");
      }
      // Filter files with valid base64 data
      const validFiles = files.filter(isValidMediaItem);
      console.log('Valid files for upload:', validFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        filePrefix: file.file.substring(0, 20)
      })));
      if (validFiles.length === 0) {
        throw new Error("No valid files to upload");
      }
      const formattedFiles = validFiles.map(file => ({
        ...file,
        file: file.file.startsWith('data:') 
          ? file.file 
          : `data:${file.type || 'image/jpeg'};base64,${file.file}`
      }));
      console.log('Formatted files:', formattedFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        filePrefix: file.file.substring(0, 20)
      })));
      return addSupportDocument(gprId, formattedFiles);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals", variables.gprId] });
      queryClient.invalidateQueries({ queryKey: ["supportDocs", variables.gprId] });
      toast.success("Supporting documents added successfully.");
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error("Failed to add supporting document.");
    },
  });
};