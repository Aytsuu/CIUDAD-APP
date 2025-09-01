import { api } from "@/api/api";
import type { MOMFileType } from "../queries/MOMUpdateQueries";

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


export const updateMOMFile = async (files: MOMFileType[], mom_id: number) => {
  try {
    const response = await api.delete(`council/delete-mom-file/${mom_id}/`)

    if(response){
        const res = await api.post('council/mom-file/', {files: files, mom_id: mom_id});

        return {res: res.data, response: response.data};
    }
  } catch (error: any) {
    console.error('MOM file update failed:', error.response?.data || error);
    throw error;
  }
};


// export const updateMinutesOfMeeting = async (mom_id: number, meetingTitle: string, meetingAgenda: string, meetingDate: string, meetingAreaOfFocus: string[], files: {id: number, name: string, type: string, file: string | null}) => {
//     try{

//         const res = await api.put(`council/update-minutes-of-meeting/${mom_id}/`, {
//             mom_title: meetingTitle,
//             mom_agenda: meetingAgenda,
//             mom_date: meetingDate,
//         })

//          await api.delete(`council/delete-mom-area-of-focus/${mom_id}/`);

//         if (meetingAreaOfFocus.length > 0) {
//             const focusPromises = meetingAreaOfFocus.map(areaId =>
//                 api.post('council/mom-area-of-focus/', {
//                     mom_id: mom_id,
//                     mof_area: areaId
//                 })
//             );
//             await Promise.all(focusPromises);
//         }

//         // if (mediaFiles.length > 0 && mediaFiles[0].status === 'uploaded') {
//         //     await updateMOMFile(mediaFiles[0], momf_id); // Use the update function with file ID
//         // }

//     } catch(err){
//         console.error(err)
//     }
// }

export const updateMinutesOfMeeting = async (mom_id: number, meetingTitle: string, meetingAgenda: string, meetingDate: string, meetingAreaOfFocus: string[], files: MOMFileType[]) => {
    try{

        const res = await api.put(`council/update-minutes-of-meeting/${mom_id}/`, {
            mom_title: meetingTitle,
            mom_agenda: meetingAgenda,
            mom_date: meetingDate,
        })

         await api.delete(`council/delete-mom-area-of-focus/${mom_id}/`);

        if (meetingAreaOfFocus.length > 0) {
            const focusPromises = meetingAreaOfFocus.map(areaId =>
                api.post('council/mom-area-of-focus/', {
                    mom_id: mom_id,
                    mof_area: areaId
                })
            );
            await Promise.all(focusPromises);
        }

        if (!files[0].id.startsWith("existing-")) {
            await updateMOMFile(files, mom_id); 
        }

     
   } catch(err){
        console.error(err)
    }
}