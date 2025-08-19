import { api } from "@/api/api";

export const createMOMFile = async (data: { mom_id: number;
    file_data: {
        name: string | undefined;
        type: string | undefined;
        file: string | undefined;
}}) => {
       
        const payload = {
            mom_id: data.mom_id,
            files: [{
                name: data.file_data.name,
                type: data.file_data.type,
                file: data.file_data.file // The actual file object
            }]
        };

        console.log(payload)

        const res = await api.post('council/mom-file/', payload);

        return res.data;

    }

export const insertMinutesOfMeeting = async (momInfo: Record<string, any>) => {
    try {

        console.log({
            mom_date: momInfo.meetingDate,
            mom_title: momInfo.meetingTitle,
            mom_agenda: momInfo.meetingAgenda,
            mom_is_archive: false,
        })

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

        return momResponse.data.mom_id;
    } catch (error) {
        console.error('Error creating Minutes of Meeting:', error);
        throw error;
    }
};

export const addSuppDoc = async(data: { mom_id: number;
    file_data: {
        name: string | undefined;
        type: string | undefined;
        file: string | undefined;
}}) => {

    const payload = {
        mom_id: data.mom_id,
        suppDocs: [{
            name: data.file_data.name,
            type: data.file_data.type,
            file: data.file_data.file // The actual file object
        }]
    };

    console.log(payload)
    const res = await api.post('council/mom-supp-doc/', payload);

    return res.data;

}