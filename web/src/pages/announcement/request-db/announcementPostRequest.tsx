import api from '@/pages/api/api';
import { formatDate } from '@/helpers/dateFormatter';


export const postAnnouncement = async (announcementInfo : Record<string, any>) => {
    try {

        console.log({
            ann_title: announcementInfo.ann_title,
            ann_details: announcementInfo.ann_details,
            ann_start_at: formatDate(announcementInfo.ann_start_at),
            ann_end_at: formatDate(announcementInfo.ann_end_at),
            ann_type: announcementInfo.ann_type,
            // staff: announcementInfo.staff,
        });

        const res = await api.post('announcement/announcements/', {
            ann_title: announcementInfo.ann_title,
            ann_details: announcementInfo.ann_details,
            ann_start_at: formatDate(announcementInfo.ann_start_at),
            ann_end_at: formatDate(announcementInfo.ann_end_at),
            ann_type: announcementInfo.ann_type,
            // staff: announcementInfo.staff,
        });

        return res.data;
    } catch (error) {
        console.error('Error posting announcement:', error);
        throw error;
    }
};