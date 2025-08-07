import { api } from "@/api/api";
import { MediaUploadType } from '@/components/ui/media-upload';

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


export const updateMOMFile = async (media: MediaUploadType[number], momf_id: number) => {
  if (media.status !== 'uploaded' || !media.publicUrl || !media.storagePath) {
    throw new Error('File upload incomplete: missing URL or path');
  }

  const formData = new FormData();
  formData.append('file', media.file);
  formData.append('momf_name', media.file.name);
  formData.append('momf_type', media.file.type || 'application/octet-stream');
  formData.append('momf_path', media.storagePath);
  formData.append('momf_url', media.publicUrl);

  try {
    const response = await api.patch(`council/update-mom-file/${momf_id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('MOM file update failed:', error.response?.data || error);
    throw error;
  }
};


export const updateMinutesOfMeeting = async (mom_id: number, momf_id: number, values: {
    meetingTitle: string;
    meetingAgenda: string;
    meetingDate: string;
    meetingAreaOfFocus: string[];
    meetingFile: string[]
},    mediaFiles: MediaUploadType) => {
    try{

        const res = await api.put(`council/update-minutes-of-meeting/${mom_id}/`, {
            mom_title: values.meetingTitle,
            mom_agenda: values.meetingAgenda,
            mom_date: values.meetingDate,
        })

         await api.delete(`council/delete-mom-area-of-focus/${mom_id}/`);

        if (values.meetingAreaOfFocus.length > 0) {
            const focusPromises = values.meetingAreaOfFocus.map(areaId =>
                api.post('council/mom-area-of-focus/', {
                    mom_id: mom_id,
                    mof_area: areaId
                })
            );
            await Promise.all(focusPromises);
        }

        if (mediaFiles.length > 0 && mediaFiles[0].status === 'uploaded') {
            await updateMOMFile(mediaFiles[0], momf_id); // Use the update function with file ID
        }

        return res.data

    } catch(err){
        console.error(err)
    }
}