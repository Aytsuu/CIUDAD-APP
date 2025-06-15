import { api } from "@/api/api";
import {ComplaintPayload } from "../complaint-type";

export const postComplaint = async (data: ComplaintPayload) => {
  try {
     const formData = new FormData();

    formData.append('complainant', JSON.stringify(data.complainant));
    formData.append('accused', JSON.stringify(data.accused));
    
    // Append other fields
    formData.append('incident_type', data.incident_type);
    formData.append('datetime', data.datetime);
    formData.append('category', data.category || 'Normal');
    formData.append('allegation', data.allegation);
    
    if (data.media_files && Array.isArray(data.media_files)) {
      data.media_files.forEach((file: File | string) => {
        if (typeof file === "string") {
          formData.append('media_urls', file);
        } else if (file instanceof File) {
          formData.append('media_files', file);
        }
      });
    }

    console.log(data.media_files)
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
