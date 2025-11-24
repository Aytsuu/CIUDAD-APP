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
                file: data.file_data.file 
            }]
        };

        const res = await api.post('council/mom-file/', payload);

        return res.data;

    }

export const insertMinutesOfMeeting = async (momInfo: Record<string, any>) => {
    try {

        const momResponse = await api.post('council/minutes-of-meeting/', {
            mom_date: momInfo.meetingDate,
            mom_title: momInfo.meetingTitle,
            mom_agenda: momInfo.meetingAgenda,
            mom_area_of_focus: momInfo.meetingAreaOfFocus,  
            mom_is_archive: false,
            staff_id: momInfo.staff_id
        });

        return momResponse.data.mom_id;
    } catch (error) {
        // console.error('Error creating Minutes of Meeting:', error);
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

    const res = await api.post('council/mom-supp-doc/', payload);

    return res.data;

}