import { api } from "@/api/api";

export const createMOMFile = async (data: { mom_id: number;
    file_data: {
        name: string;
        type: string;
        path: string;
        uri: string;
}}) => {
        console.log({
            mom_id: data.mom_id,
            momf_name: data.file_data.name,
            momf_type: data.file_data.type,
            momf_path: data.file_data.path,
            momf_url: data.file_data.uri
        })

        const res = await api.post('council/mom-file/', {
            mom_id: data.mom_id,
            momf_name: data.file_data.name,
            momf_type: data.file_data.type,
            momf_path: data.file_data.path,
            momf_url: data.file_data.uri
        });
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
        name: string;
        type: string;
        path: string;
        uri: string;
}}) => {

    console.log({
        mom_id: data.mom_id,
        momsp_name: data.file_data.name,
        momsp_type: data.file_data.type,
        momsp_path: data.file_data.path,
        momsp_url: data.file_data.uri
    })

    const res = await api.post('council/mom-supp-doc/', {
        mom_id: data.mom_id,
        momsp_name: data.file_data.name,
        momsp_type: data.file_data.type,
        momsp_path: data.file_data.path,
        momsp_url: data.file_data.uri
    });

}