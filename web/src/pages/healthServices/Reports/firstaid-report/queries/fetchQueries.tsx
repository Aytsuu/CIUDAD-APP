import { useQuery } from "@tanstack/react-query";
import { getStaffList } from "../restful-api/getAPI";
import { toast } from "sonner";
import { getFirstaidRecords } from "../restful-api/getAPI";

export const useFirstAidRecords = (yearFilter: string) => {
  return useQuery({
    queryKey: ["firstAidRecords", yearFilter],
    queryFn: () =>
      getFirstaidRecords(yearFilter === "all" ? undefined : yearFilter),
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
            formatted: [],
          };
        }

        return {
          default: staffList,
          formatted: staffList.map((staff: any) => ({
            id: String(staff.staff_id),
            name: (
              <div className="flex gap-3">
                <span className="bg-green-500 rounded text-white p-1 text-xs">
                  {staff.staff_id || "No ID"}
                </span>
                {`${staff.rp?.per?.per_fname || "Unknown"} ${
                  staff.rp?.per?.per_lname || "Staff"
                }`}
                 ( {staff.pos?.pos_title || "No Position"})
              </div>
            ),
            rawName: `${staff.rp?.per?.per_fname || "Unknown"} ${
              staff.rp?.per?.per_lname || "Staff"
            }`,
            position: staff.pos?.pos_title || "No Position",
          })),
        };
      } catch (error) {
        toast.error("Failed to fetch staff data");
        throw error;
      }
    },
  });
};
