import { api2 } from "@/api/api";
import { DateSlot, BookingRequest, SlotConfiguration, BulkConfigureRequest, CalendarDay } from "./types";

export const dateSlotService = {
  // Get all date slots
  getDateSlots: async (): Promise<DateSlot[]> => {
    const res = await api2.get("date-slots/date-slots/");
    return res.data;
  },

  // Get month data for calendar
  getMonthData: async (year: number, month: number): Promise<CalendarDay[]> => {
    const res = await api2.get("date-slots/date-slots/month_data/", {
      params: { year, month }
    });
    return res.data;
  },

  // Get single date slot
  getDateSlot: async (id: number): Promise<DateSlot> => {
    const res = await api2.get(`date-slots/date-slots/${id}/`);
    return res.data;
  },

  // Create date slot
  createDateSlot: async (data: Partial<DateSlot>): Promise<DateSlot> => {
    const res = await api2.post("date-slots/date-slots/", {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return res.data;
  },

  // Update date slot
  updateDateSlot: async (id: number, data: Partial<SlotConfiguration>): Promise<DateSlot> => {
    const res = await api2.patch(`date-slots/date-slots/${id}/`, {
      ...data,
      updated_at: new Date().toISOString()
    });
    return res.data;
  },

  // Bulk configure dates
  bulkConfigure: async (data: BulkConfigureRequest): Promise<{
    created: DateSlot[];
    updated: DateSlot[];
  }> => {
    const res = await api2.post("date-slots/date-slots/bulk_configure/", {
      ...data,
      updated_at: new Date().toISOString()
    });
    return res.data;
  },

  // Book slots
  bookSlots: async (slotId: number, booking: BookingRequest): Promise<{ message: string; slot: DateSlot }> => {
    const res = await api2.post(`date-slots/date-slots/${slotId}/book/`, booking);
    return res.data;
  },

  // Delete date slot
  deleteDateSlot: async (id: number): Promise<void> => {
    await api2.delete(`date-slots/date-slots/${id}/`);
  }
};