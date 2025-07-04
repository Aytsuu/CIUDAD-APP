// Format date (YYYY-MM-DD)
export const formatDate = (date: string | Date) => {
  if(!date) return null;
  return new Date(date).toISOString().split('T')[0]
}

// Get week number based on a given date format (YYYY-MM-DD)
// Example: date = 2025-06-11 --> returns 2
export const getWeekNumber = (dateString: string): number => {
  const date = new Date(dateString);
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekDay = firstDay.getDay();
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + firstDayWeekDay) / 7);
};

// Get month in text based on a given date format (YYYY-MM-DD)
// Example: date = 2025-06-11 --> returns June
export const getMonthName = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('default', { month: 'long' });
}

// Get the full date for the last day of the week
export const lastDayOfTheWeek = (weekNo: number, month: number, year: number) => {
  const monthIndex = month - 1;
  const firstDay = new Date(year, monthIndex, 1);
  const firstDayWeekDay = firstDay.getDay();
  const lastDayDate = 7 * weekNo - firstDayWeekDay;
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const day = Math.min(lastDayDate, lastDayOfMonth);
  return new Date(year, monthIndex, day).toISOString().split('T')[0];
};

// Get the range of days in a week (e.g September 01-05, 2025)
export const getRangeOfDaysInWeek = (week: number, month: string, year: number) => {
  const monthNum = monthNameToNumber(month); // 1-based
  if (!monthNum) return null;

  const monthIndex = monthNum - 1;
  const firstDay = new Date(year, monthIndex, 1);
  const firstDayWeekDay = firstDay.getDay();

  // Calculate the first day of the week
  const startDay = 1 + (week - 1) * 7 - firstDayWeekDay + 1;
  const lastDayOfMonth = new Date(year, monthNum, 0).getDate();
  const start = Math.max(1, startDay);
  const end = Math.min(start + 6, lastDayOfMonth);

  const startDate = new Date(year, monthIndex, start).getDate();
  const endDate = new Date(year, monthIndex, end).getDate();

  return `${month.toUpperCase()} ${startDate}-${endDate}, ${year}`;
};
// Get month in number based on a given month in text
export const monthNameToNumber = (month: string) => {
  const months = getMonths
  const idx = months.findIndex(m => m.toLowerCase() === month.toLowerCase());
  return idx === -1 ? null : idx + 1;
};

// Get long date format and 12 hour time format 
// Example: 2025-06-11 01:20:00 --> returns JUNE 11, 2025 (01:20 AM)
export const getDateTimeFormat = (dateString: string, withTime: boolean = false) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("default", { month: 'long', day: 'numeric', year: 'numeric'}); 

  if(withTime){
    const formattedTime = date.toLocaleTimeString("default", { hour: '2-digit', minute: '2-digit'});
    return `${formattedDate} (${formattedTime})`;
  }

  return `${formattedDate}`;
}

// Returns an arry of months ["January", "February", ... "December"]
export const getMonths = Array.from({ length: 12 }, (_, i) =>
  new Date(2025, i).toLocaleString('default', { month: 'long' })
);

// Get all weeks in a month
export const getAllWeeksInMonth = (monthName: string, year?: number) => {
  const targetYear = year || new Date().getFullYear();
  
  // Map month name to index (0-11)
  const monthNames = getMonths
  const monthIndex = monthNames.findIndex(m => 
    m.toLowerCase() === monthName.toLowerCase()
  );
  
  if (monthIndex === -1) {
    throw new Error(`Invalid month name: ${monthName}`);
  }

  const weeks = [];

  // Get first and last day of month (local time, no timezone shift)
  const firstDay = new Date(targetYear, monthIndex, 1);
  const lastDay = new Date(targetYear, monthIndex + 1, 0);

  // Calculate weeks for the month (using local time)
  const firstWeek = getWeekNumber(firstDay.toString());
  const lastWeek = getWeekNumber(lastDay.toString());

  for (let week = firstWeek; week <= lastWeek; week++) {
    weeks.push(week);
  }

  return weeks;
};

// Helper function to check if a week has passed
export const hasWeekPassed = (month: string, weekNo: number, year?: number) => {
  const currentDate = new Date()
  const targetYear = year || new Date().getFullYear()
  const currentYear = currentDate.getFullYear()

  // If the target year is in the past, all weeks have passed
  if (targetYear < currentYear) return true

  // If the target year is in the future, no weeks have passed
  if (targetYear > currentYear) return false

  // For the current year, check if the specific week has passed
  const monthNames = getMonths
  const monthIndex = monthNames.indexOf(month)

  if (monthIndex === -1) return false

  // Calculate the end date of the given week
  const firstDayOfMonth = new Date(targetYear, monthIndex, 1)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek

  // Calculate the end of the specified week
  const weekEndDate = new Date(targetYear, monthIndex, daysToFirstMonday + (weekNo - 1) * 7 + 6)

  return weekEndDate < currentDate
}
