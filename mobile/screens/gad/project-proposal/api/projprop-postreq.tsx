import { api } from "@/api/api";
import { MediaItem } from "@/components/ui/media-picker";

export const addSupportDocument = async (gprId: number, files: MediaItem[]) => {
  if (!gprId) {
    throw new Error("Project ID is required");
  }

  try {
    console.log('API payload:', {
      gpr_id: gprId,
      files: files.map(file => ({
        name: file.name,
        type: file.type,
        file: file.file ? file.file.substring(0, 20) + '...' : 'undefined',
        path: `uploads/${file.name || `file_${Date.now()}`}`,
        psd_is_archive: false
      }))
    });
    const response = await api.post(`/gad/project-proposals/${gprId}/support-docs/`, {
      gpr_id: gprId,
      files: files.map((file) => ({
        name: file.name || `file_${Date.now()}`,
        type: file.type || "image/jpeg",
        file: file.file!, // Type assertion: guaranteed by validFiles filter
        path: `uploads/${file.name || `file_${Date.now()}`}`,
        psd_is_archive: false,
      })),
    });
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error("Failed to upload files to server");
  }
};