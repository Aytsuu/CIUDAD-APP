import { api } from "@/api/api";
import { MediaFileType } from "@/components/ui/multi-media-upload";
import { DocumentFileType } from "@/components/ui/document-upload";

export const restoreMinutesOfMeeting = async (mom_id: string) => {
    try{
        const res = await api.put(`council/update-minutes-of-meeting/${mom_id}/`, {
            mom_is_archive: false
        })
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const archiveMinutesOfMeeting = async (mom_id: string) => {
    try{
        const res = await api.put(`council/update-minutes-of-meeting/${mom_id}/`, {
            mom_is_archive: true
        })
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const updateMinutesOfMeeting = async (mom_id: number, meetingTitle: string, meetingAgenda: string, meetingDate: string) => {
  try {
    console.log({
        mom_title: meetingTitle,
        mom_agenda: meetingAgenda,
        mom_date: meetingDate,
    })
    const res = await api.put(`council/update-minutes-of-meeting/${mom_id}/`, {
        mom_title: meetingTitle,
        mom_agenda:meetingAgenda,
        mom_date: meetingDate,
    });

    return res.data
  } catch (err) {
    console.error(err);
  }
};

export const deleteMOMAreas = async(mom_id: number) => {
  try{
      await api.delete(`council/delete-mom-area-of-focus/${mom_id}/`);

  }catch(err){
    console.error(err)
  }
}

export const handleMOMAreaOfFocus = async (mom_id: number, areas: string[]) => {
  try {

    if (areas && areas.length > 0) {
      await Promise.all(
        areas.map(areaId =>
          api.post('council/mom-area-of-focus/', {
            mom_id,
            mof_area: areaId
          })
        )
      );
    }
  } catch (err) {
    console.error("Area update failed at step:", {
      error: err,
      mom_id,
      areas
    });
    throw err;
  }
};

export const handleMOMFileUpdates = async (mom_id: number, momf_id: number, documentFiles: DocumentFileType[]) => {
  try {
    const mainFile = documentFiles[0];

    if(!mainFile.path)
      return;
    
    if (mainFile) {
      const payload = {
        momf_name: mainFile.name,
        momf_type: mainFile.type || 'application/pdf',
        momf_path: mainFile.path || '',
        momf_url: mainFile.publicUrl
      };

      if (mainFile.id?.startsWith('existing-')) {
        // Update existing file metadata
        await api.patch(`council/update-mom-file/${momf_id}/`, payload);
      } else {
        // Create new file record
        await api.post('council/mom-file/', { ...payload, mom_id });
      }
    }
  } catch (err) {
    console.error("Error updating MOM file:", err);
    throw err;
  }
};

export const handleMOMSuppDocUpdates = async (mom_id: number, mediaFiles: MediaFileType[]) => {
  try {
    // Get current files from server
    const currentFilesRes = await api.get(`council/meeting-supp-docs/${mom_id}/`);
    const currentFiles = currentFilesRes.data || [];
    
    // Determine files to keep and delete
    const existingFileIds = mediaFiles
      .filter(file => file.id?.startsWith('existing-'))
      .map(file => parseInt(file.id.replace('existing-', '')));
    
    // Delete files that were removed
    const filesToDelete = currentFiles.filter((file: any) => !existingFileIds.includes(file.momsp_id));
    await Promise.all(filesToDelete.map((file: any) => 
      api.delete(`council/delete-mom-supp-doc/${file.momsp_id}/`)
    ));
    
    // Add new files
    const filesToAdd = mediaFiles.filter(file => !file.id?.startsWith('existing-'));
    await Promise.all(filesToAdd.map(file =>
      api.post('council/mom-supp-doc/', {
        mom_id,
        momsp_name: file.name || `file-${Date.now()}`,
        momsp_type: file.type.includes('image') ? 'image' : 'file',
        momsp_path: file.path || '',
        momsp_url: file.publicUrl || file.uri
      })
    ));
  } catch (err) {
    console.error("Error updating supporting documents:", err);
    throw err;
  }
};