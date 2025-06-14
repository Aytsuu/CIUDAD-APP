import { api } from "@/api/api";
import supabase from "@/supabase/supabase"; // Make sure you have Supabase client configured
import { SupabaseUploadResponse, ComplaintPayload } from "../complaint-type";

export const postComplaint = async (data: ComplaintPayload) => {
  try {
    // Step 1: Upload files to Supabase
    const uploadedFiles: SupabaseUploadResponse[] = [];
    
    for (const file of data.media_files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `complaints/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('blotter-files') // Your bucket name
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blotter-files') // Fixed: use same bucket name
        .getPublicUrl(filePath);

      uploadedFiles.push({
        original_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_path: `uploads/${fileName}` // This creates the format you want
      });
    }

    // Step 2: Prepare form data for Django
    const formData = new FormData();
    
    formData.append('complainant', JSON.stringify(data.complainant));
    formData.append('accused', JSON.stringify(data.accused));
    formData.append('incident_type', data.incident_type);
    formData.append('datetime', data.datetime);
    formData.append('allegation', data.allegation);
    formData.append('media_files', JSON.stringify(uploadedFiles)); // Send Supabase URLs

    // Debug logging
    console.log('Sending data to Django:');
    console.log('complainant:', data.complainant);
    console.log('accused:', data.accused);
    console.log('incident_type:', data.incident_type);
    console.log('datetime:', data.datetime);
    console.log('allegation:', data.allegation);
    console.log('media_files:', uploadedFiles);

    return api.post('/complaint/create/', formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
      },
    });

  } catch (error) {
    console.error('Error uploading files or creating complaint:', error);
    throw error;
  }
};

export const getComplaints = () => {
  return api.get("/complaint/list/");
};

export const getComplaintById = (id: string) => {
  return api.get(`/complaint/${id}/`);
};

export const archiveComplaint = (id: string) => {
  return api.patch(`/complaint/${id}/archive/`);
};

export const getArchivedComplaints = () => {
  return api.get("/complaint/archived/");
};

export const restoreComplaint = (id: string) => {
  return api.patch(`/complaint/${id}/restore/`);
};

export const deleteComplaint = (id: string) => {
  return api.delete(`/complaint/${id}/`);
};
