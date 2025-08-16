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

        console.log("payload", payload)
        const response = await api.post('council/mom-file/', payload)
    
        return response.data;
    } catch (error) {
        console.error(error)
        throw error;
    }
};

export const insertMinutesOfMeeting = async (momInfo: Record<string, any>, files: { name: string; type: string; file: string | undefined }[]) => {
    try {
        const momResponse = await api.post('council/minutes-of-meeting/', {
            mom_date: momInfo.meetingDate,
            mom_title: momInfo.meetingTitle,
            mom_agenda: momInfo.meetingAgenda,
            mom_is_archive: false,
        });

        const momId = momResponse.data.mom_id || 0;

    
        for (const areaId of momInfo.meetingAreaOfFocus) {
            await api.post('council/mom-area-of-focus/', {
                mom_id: momId,
                mof_area: areaId
            });
        }
        

        // 3. Handle file upload if exists
        if (momId != null) {
            await createMOMFile(files, momId);
        }

        return momResponse.data;
    } catch (error) {
        console.error('Error creating Minutes of Meeting:', error);
        throw error;
    }
};