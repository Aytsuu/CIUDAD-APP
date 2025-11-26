import { formatDate } from "@/helpers/dateHelper";
import { IndividualFPRecordDetail } from "@/pages/familyplanning/request-db/GetRequest";

export const getFollowUpDisplayStatus = (followv_status?: string, followUpDate?: string) => {
  if (!followv_status || !followUpDate) {
    return {
      status: "No Follow-up",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
    };
  }
  if (followv_status.toLowerCase() === "missed") {
    return {
      status: "Missed",
      className: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
    };
  }
  if (followv_status.toLowerCase() === "dropout") {
    return {
      status: "Dropped Out",
      className: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
    };
  }
  if (followv_status.toLowerCase() === "completed") {
    return {
      status: "Completed",
      className: "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
    };
  }
  if (followv_status.toLowerCase() === "pending") {
    const today = new Date();
    const followUp = new Date(followUpDate);
    today.setHours(0, 0, 0, 0);
    followUp.setHours(0, 0, 0, 0);
    // if (followUp < today) {
    //   return {
    //     status: "Missed",
    //     className: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
    //   };
    // } else if (followUp.getTime() === today.getTime()) {
    //   return {
    //     status: "Due Today",
    //     className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
    //   };
    // } else {
    //   return {
    //     status: "Pending",
    //     className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
    //   };
    // }
  }
  return {
    status: followv_status,
    className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
  };
};


export const calculateDaysDifference = (dateString: string): number => {
  if (!dateString) return Infinity;
  const today = new Date();
  const targetDate = new Date(dateString);
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const shouldShowFollowUpWarning = (record: IndividualFPRecordDetail): { showWarning: boolean; daysLeft: number } => {
  if (!record.dateOfFollowUp) {
    return { showWarning: false, daysLeft: Infinity };
  }
  const daysDifference = calculateDaysDifference(record.dateOfFollowUp);
  return {
    showWarning: daysDifference < -3,
    daysLeft: daysDifference
  };
};


export const hasLatestGroupMissedFollowUps = (groupedRecords: [string, IndividualFPRecordDetail[]][]) => {
  if (groupedRecords.length === 0) return false;
  const latestGroup = groupedRecords[0][1];
  return latestGroup.some((record) => {
    const { status } = getFollowUpDisplayStatus(record.followv_status, record.dateOfFollowUp);
    return status === "Missed" || status === "Dropped Out";
  });
};

export const getLatestGroupMissedFollowUps = (groupedRecords: [string, IndividualFPRecordDetail[]][]) => {
  if (groupedRecords.length === 0) return [];
  const latestGroup = groupedRecords[0][1];
  return latestGroup.filter((record) => {
    const { status } = getFollowUpDisplayStatus(record.followv_status, record.dateOfFollowUp);
    return status === "Missed" || status === "Dropped Out";
  });
};


export const getGroupHeader = (records: IndividualFPRecordDetail[]) => {
    if (records.length === 0) return "Unknown";
    const latestRecord = records[0];
    const date = formatDate(latestRecord.created_at);
    const method = latestRecord.method_used || latestRecord.otherMethod || "N/A";
    return `${date} (${method})`;
  };



