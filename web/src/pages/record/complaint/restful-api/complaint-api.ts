import { api } from "@/api/api";
import {ComplaintPayload } from "../complaint-type";
import supabase from "@/supabase/supabase";

export const postComplaint = async (data: ComplaintPayload) => {
  try {
    const formData = new FormData();

    // Append objects as JSON strings
    formData.append('complainant', JSON.stringify(data.complainant));
    formData.append('accused', JSON.stringify(data.accused));
    
    // Append other fields
    formData.append('incident_type', data.incident_type);
    formData.append('datetime', data.datetime);
    formData.append('category', data.category || 'Normal');
    formData.append('allegation', data.allegation);
    
    if (data.media_files) {
      data.media_files.forEach((file: File | string) => {
        if (typeof file === "string") {
          formData.append('media_urls', file);
        } else {
          formData.append('media_files', file);
        }
      });
    }

    // Get session first to ensure we have a token
    const { data: { session } } = await supabase.auth.getSession();
    
    return api.post('/complaint/create/', formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${session?.access_token}` // Explicitly add token
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
