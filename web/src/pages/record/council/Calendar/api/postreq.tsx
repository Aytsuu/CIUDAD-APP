import api from '@/pages/api/api';
import { formatDate } from '@/helpers/dateFormatter';

export const postCouncilEvent = async (eventInfo: Record<string, any>) => {
    try {
        console.log({
            ce_title: eventInfo.ce_title,
            ce_place: eventInfo.ce_place,
            ce_date: formatDate(eventInfo.ce_date),
            ce_time: eventInfo.ce_time,
            ce_type: eventInfo.ce_type,
            ce_description: eventInfo.ce_description,
            ce_is_archive: eventInfo.ce_is_archive || false,
            staff_id: eventInfo.staff_id,
        });

        const res = await api.post('council/event-meeting/', {
            ce_title: eventInfo.ce_title,
            ce_place: eventInfo.ce_place,
            ce_date: formatDate(eventInfo.ce_date),
            ce_time: eventInfo.ce_time,
            ce_type: eventInfo.ce_type,
            ce_description: eventInfo.ce_description,
            ce_is_archive: eventInfo.ce_is_archive || false,
            staff_id: eventInfo.staff_id,
        });

        return res.data.ce_id;
    } catch (err) {
        console.error("Error creating council event:", err);
        throw err;
    }
};

export const postAttendee = async (attendeeInfo: Record<string, any>) => {
    try {
        console.log({
            atn_present_or_absent: attendeeInfo.atn_present_or_absent,
            ce_id: attendeeInfo.ce_id,
            staff_id: attendeeInfo.staff_id,
        });

        const res = await api.post('council/attendees/', {
            atn_name: attendeeInfo.atn_name,
            atn_designation: attendeeInfo.atn_designation,
            atn_present_or_absent: attendeeInfo.atn_present_or_absent,
            ce_id: attendeeInfo.ce_id,
            staff_id: attendeeInfo.staff_id,
        });

        return res.data.atn_id;
    } catch (err) {
        console.error("Error creating attendee:", err);
        throw err;
    }
};

export const postAttendanceSheet = async (attendanceInfo: Record<string, any>) => {
    try {
        console.log({
            ce_id: attendanceInfo.ce_id,
            file_id: attendanceInfo.file_id,
            staff_id: attendanceInfo.staff_id,
        });

        const res = await api.post('council/attendance-sheets/', {
            ce_id: attendanceInfo.ce_id,
            file_id: attendanceInfo.file_id,
            staff_id: attendanceInfo.staff_id,
        });

        return res.data.att_id;
    } catch (err) {
        console.error("Error creating attendance sheet:", err);
        throw err;
    }
};