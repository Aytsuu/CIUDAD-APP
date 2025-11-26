import { api } from "@/api/api";
import type { MOMFileType, MOMSuppDoc } from "../queries/MOMUpdateQueries";

export const restoreMinutesOfMeeting = async (mom_id: string) => {
    try{
        const res = await api.put(`council/update-minutes-of-meeting/${mom_id}/`, {
            mom_is_archive: false
        })
        return res.data
    }catch(err){
        // console.error(err)
        throw err
    }
}

export const archiveMinutesOfMeeting = async (mom_id: string) => {
    try{
        const res = await api.put(`council/update-minutes-of-meeting/${mom_id}/`, {
            mom_is_archive: true
        })
        return res.data
    }catch(err){
        // console.error(err)
        throw err
    }
}


export const updateMOMFile = async (files: MOMFileType[], mom_id: number) => {
  try {
    const response = await api.delete(`council/delete-mom-file/${mom_id}/`)

    if(response){
        const res = await api.post('council/mom-file/', {files: files, mom_id: mom_id});

        return {res: res.data, response: response.data};
    }
  } catch (error: any) {
    // console.error('MOM file update failed:', error.response?.data || error);
    throw error;
  }
};


export const updateMinutesOfMeeting = async (mom_id: number, meetingTitle: string, meetingAgenda: string, meetingDate: string, meetingAreaOfFocus: string[], files: MOMFileType[]) => {
    try{

        const res = await api.put(`council/update-minutes-of-meeting/${mom_id}/`, {
            mom_title: meetingTitle,
            mom_agenda: meetingAgenda,
            mom_area_of_focus: meetingAreaOfFocus,
            mom_date: meetingDate,
        })

        if (!files[0].id.startsWith("existing-") && res) {
            await updateMOMFile(files, mom_id); 
        }

     
   } catch(err){
        // console.error(err)
        throw err
    }
}

export const handleMOMSuppDocUpdates = async (mom_id: number, suppDocs: MOMSuppDoc[]) => {
  try {
     // Get current files from server
    const currentFilesRes = await api.get(`council/meeting-supp-docs/${mom_id}/`);
    const currentFiles = currentFilesRes.data || [];

    
    // Determine files to keep and delete
    const existingFileIds = suppDocs
      .filter(file => file.id?.startsWith('existing-'))
      .map(file => parseInt(file.id.replace('existing-', '')));
    
    // Delete files that were removed
    const filesToDelete = currentFiles.filter((file: any) => !existingFileIds.includes(file.momsp_id));
    await Promise.all(filesToDelete.map((file: any) => 
      api.delete(`council/delete-mom-supp-doc/${file.momsp_id}/`)
    ));
    
    // Add new files
    const filesToAdd = suppDocs.filter(file => !file.id?.startsWith('existing-'));

    const payload = {
      mom_id,
      suppDocs: filesToAdd.map(file => ({
        name: file.name,
        type: file.type,
        file: file.file
      }))
    }

    if (payload.suppDocs.length > 0) {
      const res = await api.post('council/mom-supp-doc/', payload);
      return res.data;
    }
  } catch (err) {
    // console.error("Error updating supporting documents:", err);
    throw err;
  }
};