import { isSameDay, parseISO, isValid } from "date-fns";

// Helper: Get nested property from object via path
export const getValueByPath = (obj: any, path: string[]): any => {
  return path.reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    if (Array.isArray(acc) && !isNaN(Number(part))) {
      return acc[Number(part)];
    }
    return acc[part];
  }, obj);
};

// Helper: React Native styles for changed vs unchanged fields
export const diffTextStyle = {
  changed: {
    color: "#EF4444", // Tailwind red-500
    fontWeight: "600",
  },
  unchanged: {},
};

// Main Function: Return the appropriate style object
export const getDiffStyle = (
  currentColumnValue: any,
  previousRecordValue: any,
  isCurrentRecord: boolean
): any => {
  const normalizeValue = (val: any) =>
    val === null || val === undefined || val === "" ? null : val;
  const normalizedCurrent = normalizeValue(currentColumnValue);
  const normalizedPrevious = normalizeValue(previousRecordValue);

  if (!isCurrentRecord || normalizedPrevious === undefined) {
    return diffTextStyle.unchanged;
  }

  if (normalizedCurrent === null && normalizedPrevious === null) {
    return diffTextStyle.unchanged;
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
      ? diffTextStyle.changed
      : diffTextStyle.unchanged;
  }

  if (Array.isArray(normalizedCurrent) && Array.isArray(normalizedPrevious)) {
    return JSON.stringify(normalizedCurrent) !==
      JSON.stringify(normalizedPrevious)
      ? diffTextStyle.changed
      : diffTextStyle.unchanged;
  }

  return normalizedCurrent !== normalizedPrevious
    ? diffTextStyle.changed
    : diffTextStyle.unchanged;
};
