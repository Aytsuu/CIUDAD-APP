import api from '@/pages/api/api';
import { formatDate } from '@/helpers/dateFormatter';

export const announcementPutRequest = async (ann_id: number, announcementInfo: Record<string, any>) => {
    try {
        const res = await api.put(`announcement/announcements/${ann_id}/`, {
            ann_title: announcementInfo.ann_title,
            ann_details: announcementInfo.ann_details,
            ann_start_at: formatDate(announcementInfo.ann_start_at),
            ann_end_at: formatDate(announcementInfo.ann_end_at),
            ann_type: announcementInfo.ann_type,
            // staff: announcementInfo.staff, // Uncomment if staff is part of the request
        }); 

        return res.data;
        
    } catch (error) {
        console.error("Error updating announcement:", error);
        throw error;
    }
};
