export const calculateNextVisitDate = (
  interval: number,
  timeUnit: string,
  createdDate: string
): Date => {
  if (!timeUnit) {
    console.warn("⚠️ timeUnit is undefined");
    return new Date(createdDate); // Return the original date if no unit provided
  }

  const date = new Date(createdDate);
  console.log("📅 Created date:", createdDate);
  console.log("➕ Interval:", interval, "Unit:", timeUnit);

  switch (timeUnit.toUpperCase()) {
    case "DAYS":
      date.setDate(date.getDate() + interval);
      break;
    case "WEEKS":
      date.setDate(date.getDate() + interval * 7);
      break;
    case "MONTHS":
      date.setMonth(date.getMonth() + interval);
      break;
    case "YEARS":
      date.setFullYear(date.getFullYear() + interval);
      break;
    default:
      console.warn("⚠️ Unknown time unit:", timeUnit);
      break;
  }

  console.log("🗓️ Next visit date calculated:", date.toISOString());
  return date;
};
