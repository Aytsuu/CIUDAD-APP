import { api } from "@/api/api";

export const delCouncilEvent = async (
  ce_id: number,
  permanent: boolean = false
) => {
  // Validate ID first
  if (!ce_id || isNaN(ce_id)) {
    throw new Error(`Invalid event ID: ${ce_id}`);
  }

  try {
    const res = await api.delete(`council/event-meeting/${ce_id}/`, {
      params: { permanent }, 
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const restoreCouncilEvent = async (ce_id: number) => {
  try {
    const res = await api.put(`council/event-meeting/${ce_id}/restore/`);

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const delAttendee = async (atn_id: number) => {
  try {
    const res = await api.delete(`council/attendees/${atn_id}/`);

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const delAttendanceSheet = async (
  att_id: number,
  permanent: boolean = false
) => {
  if (!att_id || isNaN(att_id)) {
    throw new Error(`Invalid attendance sheet ID: ${att_id}`);
  }

  try {
    const res = await api.delete(`council/attendance-sheets/${att_id}/`, {
      params: { permanent },
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const restoreAttendanceSheet = async (att_id: number) => {
  try {
    const res = await api.put(`council/attendance-sheets/${att_id}/restore/`);

    return res.data;
  } catch (err) {
    throw err;
  }
};
