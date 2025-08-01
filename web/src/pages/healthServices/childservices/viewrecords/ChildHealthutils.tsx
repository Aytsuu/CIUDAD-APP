import { isSameDay, parseISO, isValid } from "date-fns";
// import { ChildHealthHistoryRecord, CHSupplement, CHSSupplementStat } from "./types";

export const getValueByPath = (obj: any, path: string[]): any => {
  return path.reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    if (Array.isArray(acc) && !isNaN(Number(part))) {
      return acc[Number(part)];
    }
    return acc[part];
  }, obj);
};

export const getDiffClass = (
  currentColumnValue: any,
  previousRecordValue: any,
  isCurrentRecord: boolean
): string => {
  const normalizeValue = (val: any) =>
    val === null || val === undefined || val === "" ? null : val;
  const normalizedCurrent = normalizeValue(currentColumnValue);
  const normalizedPrevious = normalizeValue(previousRecordValue);

  if (!isCurrentRecord || normalizedPrevious === undefined) {
    return "";
  }

  if (normalizedCurrent === null && normalizedPrevious === null) {
    return "";
  }

  if (
    typeof normalizedCurrent === "string" &&
    typeof normalizedPrevious === "string" &&
    (normalizedCurrent.match(/^\d{4}-\d{2}-\d{2}/) ||
      normalizedCurrent.match(/^\d{4}-\d{2}-\d{2}T/)) &&
    (normalizedPrevious.match(/^\d{4}-\d{2}-\d{2}/) ||
      normalizedPrevious.match(/^\d{4}-\d{2}-\d{2}T/))
  ) {
    const currentDate = parseISO(normalizedCurrent);
    const previousDate = parseISO(normalizedPrevious);
    return isValid(currentDate) &&
      isValid(previousDate) &&
      !isSameDay(currentDate, previousDate)
      ? "text-red-500 font-semibold"
      : "";
  }

  if (Array.isArray(normalizedCurrent) && Array.isArray(normalizedPrevious)) {
    return JSON.stringify(normalizedCurrent) !==
      JSON.stringify(normalizedPrevious)
      ? "text-red-500 font-semibold"
      : "";
  }

  return normalizedCurrent !== normalizedPrevious
    ? "text-red-500 font-semibold"
    : "";
};

// export const formatSupplement = (supplement: CHSupplement): string => {
//   const medDetails = supplement.medrec_details?.minv_details;
//   if (!medDetails) return "N/A";
//   const name = medDetails.med_detail?.med_name || "Unknown Medicine";
//   const dosage = medDetails.minv_dsg
//     ? `${medDetails.minv_dsg}${medDetails.minv_dsg_unit || ""}`
//     : "N/A";
//   const form = medDetails.minv_form || "N/A";
//   const qty = supplement.medrec_details?.medrec_qty || "N/A";
//   return `${name} - Dosage: ${dosage} - Form: ${form} - Qty: ${qty}`;
// };

// export const formatSupplementStatus = (
//   status: CHSSupplementStat,
//   record: ChildHealthHistoryRecord,
//   isMatchingStatus: boolean
// ) => {
//   const statusUpdatedAt =
//     status?.updated_at && isValid(new Date(status.updated_at))
//       ? format(new Date(status.updated_at), "PPP")
//       : "N/A";
//   const dateCompleted =
//     status?.date_completed && isValid(new Date(status.date_completed))
//       ? format(new Date(status.date_completed), "PPP")
//       : "N/A";

//   // Check if updated_at matches created_at
//   const showCompletedDate =
//     status.updated_at &&
//     record.created_at &&
//     isSameDay(new Date(status.updated_at), new Date(record.created_at));

//   // Check if status contains keywords
//   const hasBirthwt =
//     status?.status_type?.toLowerCase().includes("birthwt") ||
//     status?.status_type?.toLowerCase().includes("birth weight");
//   const hasAnemic = status?.status_type?.toLowerCase().includes("anemic");

//   return (
//     <div className="flex justify-center">
//       <div
//         className={isMatchingStatus ? "text-red-500 font-semibold" : ""}
//       >
//         <div className="font-medium text-left">
//           {status?.status_type || "N/A"}
//         </div>
//         {hasBirthwt && (
//           <div className="ml-4 text-left">
//             - Birth Weight: {status?.birthwt || "N/A"}
//           </div>
//         )}
//         <div className="ml-4 text-left">
//           - Seen:{" "}
//           {status?.date_seen && isValid(new Date(status.date_seen))
//             ? format(new Date(status.date_seen), "PPP")
//             : "N/A"}
//         </div>
//         <div className="ml-4 text-left">
//           - Given Iron:{" "}
//           {status?.date_given_iron && isValid(new Date(status.date_given_iron))
//             ? format(new Date(status.date_given_iron), "PPP")
//             : "N/A"}
//         </div>
//         {showCompletedDate && (
//           <div className="ml-4 text-left">- Completed: {dateCompleted}</div>
//         )}
//       </div>
//     </div>
//   );
// };