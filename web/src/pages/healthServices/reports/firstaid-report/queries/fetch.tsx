import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStaffList,getFirstaidReports,getFirstaidRecords,getFirstAidChart, getMidwifeList, getDoctorList } from "@/pages/healthServices/reports/firstaid-report/restful-api/getAPI";


export const useFirstAidRecords = (page: number, pageSize: number, searchQuery: string, yearFilter: string) => {
  return useQuery({
    queryKey: ["firstAidRecords", page, pageSize, searchQuery, yearFilter],
    queryFn: () => getFirstaidRecords(page, pageSize, searchQuery, yearFilter === "all" ? undefined : yearFilter)
  });
};

export const useFirstAidReports = (month: string, page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["fareport", month, page, pageSize, searchQuery],
    queryFn: () => getFirstaidReports(month, page, pageSize, searchQuery)
  });
};

export const useFirstAidChart = (month: string) => {
  return useQuery({
    queryKey: ["firstAidChart", month],
    queryFn: async () => getFirstAidChart(month)
  });
};




export const fetchStaffWithPositions = () => {
  return useQuery({
    queryKey: ["staffPositions"],
    queryFn: async () => {
      try {
        const staffList = await getStaffList(); // You'll need to implement this API call

        if (!staffList || !Array.isArray(staffList)) {
          return {
            default: [],
            formatted: []
          };
        }

        return {
          default: staffList,
          formatted: staffList.map((staff: any) => ({
            id: `${staff.staff_id}-${staff.rp?.per?.per_fname || "Unknown"}-${staff.rp?.per?.per_lname || "Staff"}-${staff.pos?.pos_title || "No Position"}`,
            name: (
              <div className="flex gap-3">
          <span className="bg-green-500 rounded text-white p-1 text-xs">{staff.staff_id || "No ID"}</span>
          {`${staff.rp?.per?.per_fname || "Unknown"} ${staff.rp?.per?.per_lname || "Staff"}`} ({staff.pos?.pos_title || "No Position"})
              </div>
            ),
            rawName: `${staff.rp?.per?.per_fname || "Unknown"} ${staff.rp?.per?.per_lname || "Staff"}`,
            position: staff.pos?.pos_title || "No Position"
          }))
        };
      } catch (error) {
        toast.error("Failed to fetch staff data");
        throw error;
      }
    }
  });
};

export const fetchMidwife = () => {
  return useQuery({
    queryKey: ["midwifePositions"],
    queryFn: async () => {
      try {
        const staffList = await getMidwifeList(); // You'll need to implement this API call

        if (!staffList || !Array.isArray(staffList)) {
          return {
            default: [],
            formatted: []
          };
        }

        return {
          default: staffList,
          formatted: staffList.map((staff: any) => ({
            id: `${staff.staff_id}-${staff.rp?.per?.per_fname || "Unknown"}-${staff.rp?.per?.per_lname || "Staff"}-${staff.pos?.pos_title || "No Position"}`,
            name: (
              <div className="flex gap-3">
          <span className="bg-green-500 rounded text-white p-1 text-xs">{staff.staff_id || "No ID"}</span>
          {`${staff.rp?.per?.per_fname || "Unknown"} ${staff.rp?.per?.per_lname || "Staff"}`} ({staff.pos?.pos_title || "No Position"})
              </div>
            ),
            rawName: `${staff.rp?.per?.per_fname || "Unknown"} ${staff.rp?.per?.per_lname || "Staff"}`,
            position: staff.pos?.pos_title || "No Position"
          }))
        };
      } catch (error) {
        toast.error("Failed to fetch staff data");
        throw error;
      }
    }
  });
};



export const fetchDoctor = () => {
  return useQuery({
    queryKey: ["doctorPositions"],
    queryFn: async () => {
      try {
        const staffList = await getDoctorList(); // You'll need to implement this API call

        if (!staffList || !Array.isArray(staffList)) {
          return {
            default: [],
            formatted: []
          };
        }

        return {
          default: staffList,
          formatted: staffList.map((staff: any) => ({
            id: `${staff.staff_id}-${staff.rp?.per?.per_fname || "Unknown"}-${staff.rp?.per?.per_lname || "Staff"}-${staff.pos?.pos_title || "No Position"}`,
            name: (
              <div className="flex gap-3">
          <span className="bg-green-500 rounded text-white p-1 text-xs">{staff.staff_id || "No ID"}</span>
          {`${staff.rp?.per?.per_fname || "Unknown"} ${staff.rp?.per?.per_lname || "Staff"}`} ({staff.pos?.pos_title || "No Position"})
              </div>
            ),
            rawName: `${staff.rp?.per?.per_fname || "Unknown"} ${staff.rp?.per?.per_lname || "Staff"}`,
            position: staff.pos?.pos_title || "No Position"
          }))
        };
      } catch (error) {
        toast.error("Failed to fetch staff data");
        throw error;
      }
    }
  });
};
