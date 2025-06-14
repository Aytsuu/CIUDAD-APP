import { api } from "@/api/api";
import { MediaUploadType } from '@/components/ui/media-upload';

export const createMOMFile = async (media: MediaUploadType[number], momId: number) => {
if (media.status !== 'uploaded' || !media.publicUrl || !media.storagePath) {
    throw new Error('File upload incomplete: missing URL or path');
}

const formData = new FormData();
formData.append('file', media.file);
formData.append('mom_id', momId.toString());
formData.append('momf_name', media.file.name);
formData.append('momf_type', media.file.type || 'application/octet-stream');
formData.append('momf_path', media.storagePath);
formData.append('momf_url', media.publicUrl);

try {
    const response = await api.post('council/mom-file/', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
    });
    return response.data;
} catch (error: any) {
    console.error('MOM file upload failed:', error.response?.data || error);
    throw error;
}
};

export const insertMinutesOfMeeting = async (momInfo: Record<string, any>, mediaFiles: MediaUploadType) => {
    try {
        const momResponse = await api.post('council/minutes-of-meeting/', {
            mom_date: momInfo.meetingDate,
            mom_title: momInfo.meetingTitle,
            mom_agenda: momInfo.meetingAgenda,
            mom_is_archive: false,
        });

        const momId = momResponse.data.mom_id;

    
        for (const areaId of momInfo.meetingAreaOfFocus) {
            await api.post('council/mom-area-of-focus/', {
                mom_id: momId,
                mof_area: areaId
            });
        }
        

        // 3. Handle file upload if exists
        if (mediaFiles.length > 0 && mediaFiles[0].status === 'uploaded') {
            await createMOMFile(mediaFiles[0], momId);
        }

        return momResponse.data;
    } catch (error) {
        console.error('Error creating Minutes of Meeting:', error);
        throw error;
    }
};