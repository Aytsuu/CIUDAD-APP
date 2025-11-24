import { api } from "@/api/api";

export const createMOMFile = async (files: { name: string; type: string; file: string | undefined }[], momId: number) => {
    try {

        const payload = {
            mom_id: momId,
            files: files.map(file => ({
                name: file.name,
                type: file.type,
                file: file.file
            }))
        };

        const response = await api.post('council/mom-file/', payload)
    
        return response.data;
    } catch (error) {
        // console.error(error)
        throw error;
    }
};

export const insertMinutesOfMeeting = async (momInfo: Record<string, any>, files: { name: string; type: string; file: string | undefined }[]) => {
    try {
        const momResponse = await api.post('council/minutes-of-meeting-active/', {
            mom_date: momInfo.meetingDate,
            mom_title: momInfo.meetingTitle,
            mom_agenda: momInfo.meetingAgenda,
            mom_area_of_focus: momInfo.meetingAreaOfFocus,
            mom_is_archive: false,
            staff_id: momInfo.staff_id
        });

        const momId = momResponse.data.mom_id || 0;

    
        if (momId != null) {
            await createMOMFile(files, momId);
        }

        return momResponse.data;
    } catch (error) {
        // console.error('Error creating Minutes of Meeting:', error);
        throw error;
    }
};