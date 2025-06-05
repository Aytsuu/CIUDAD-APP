import api from '@/pages/api/api';
import { formatDate } from '@/helpers/dateFormatter';

export const putCouncilEvent = async (ce_id: number, eventInfo: Record<string, any>) => {
    try {
        const res = await api.put(`council/event-meeting/${ce_id}/`, {
            ce_title: eventInfo.ce_title,
            ce_place: eventInfo.ce_place,
            ce_date: formatDate(eventInfo.ce_date),
            ce_time: eventInfo.ce_time,
            ce_type: eventInfo.ce_type,
            ce_description: eventInfo.ce_description,
            ce_is_archive: eventInfo.ce_is_archive || false,
            staff_id: eventInfo.staff_id,
        });

        return res.data;
    } catch (err) {
        console.error("Error updating council event:", err);
        throw err;
    }
};

export const putAttendee = async (atn_id: number, attendeeInfo: Record<string, any>) => {
    try {
        const res = await api.put(`council/attendees/${atn_id}/`, {
            atn_present_or_absent: attendeeInfo.atn_present_or_absent,
            ce_id: attendeeInfo.ce_id,
            staff_id: attendeeInfo.staff_id,
        });

        return res.data;
    } catch (err) {
        console.error("Error updating attendee:", err);
        throw err;
    }
};

export const putAttendanceSheet = async (att_id: number, attendanceInfo: Record<string, any>) => {
    try {
        const res = await api.put(`council/attendance-sheet/${att_id}/`, {
            ce_id: attendanceInfo.ce_id,
            file_id: attendanceInfo.file_id,
            staff_id: attendanceInfo.staff_id,
        });

        return res.data;
    } catch (err) {
        console.error("Error updating attendance sheet:", err);
        throw err;
    }
};