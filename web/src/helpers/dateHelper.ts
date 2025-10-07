// Format date (YYYY-MM-DD) or (July 10, 2025)
export const formatDate = (date: string | Date, type?: string) => {
  if (!date) return null;
  const d = new Date(date);

  switch (type) {
    case 'short':
      return d.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    case 'long':
      return d.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    default:
      // Format YYYY-MM-DD in local time
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
  }
};

interface TimeAgoOptions {
  detailed?: boolean;
  includeWeeks?: boolean;
}

export const formatTimeAgo = (
  timestamp: string | Date, 
  options: TimeAgoOptions = {}
): string => {
  const { detailed = false, includeWeeks = false } = options;
  
  if (!timestamp) return 'Unknown';
  
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMs = now.getTime() - past.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  
  // Just now
  if (diffInSeconds < 10) {
    return detailed ? 'Just now' : 'Now';
  }
  
  // Seconds
  if (diffInSeconds < 60) {
    if (detailed) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    return `${diffInSeconds}s ago`;
  }
  
  // Minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (detailed) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    return `${diffInMinutes}m ago`;
  }
  
  // Hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (detailed) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    return `${diffInHours}h ago`;
  }
  
  // Days
  const diffInDays = Math.floor(diffInHours / 24);
  if (!includeWeeks || diffInDays < 7) {
    if (detailed) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    return `${diffInDays}d ago`;
  }
  
  // Weeks (optional)
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    if (detailed) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
    }
    return `${diffInWeeks}w ago`;
  }
  
  // Months
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    if (detailed) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }
    return `${diffInMonths}mo ago`;
  }
  
  // Years
  const diffInYears = Math.floor(diffInDays / 365);
  if (detailed) {
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  }
  return `${diffInYears}y ago`;
};

// Helper functions for date formatting (same as in your main component)
export const formatSupplementDate = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
};

export const formatMnpDates = (dates: string[]) => {
  if (!dates || dates.length === 0) return "-";
  return dates.map((date) => formatSupplementDate(date)).join(", ");
};
// Get week number based on a given date format (YYYY-MM-DD)
// Example: date = 2025-06-11 --> returns 2
export const getWeekNumber = (dateString: string): number => {
  const date = new Date(dateString);
  const dayOfMonth = date.getDate();
  return Math.ceil(dayOfMonth / 7);
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
export const getRangeOfDaysInWeek = (
  week: number, 
  month: string, 
  year: number, 
  onlyNumber: boolean = false
) => {
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

  if(onlyNumber) return { start_day: startDate, end_day: endDate }
  return `${month.toUpperCase()} ${startDate}-${endDate}, ${year}`;
};

// Get month in number based on a given month in text
export const monthNameToNumber = (month: string) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const idx = months.findIndex(m => m.toLowerCase() === month.toLowerCase());
  return idx === -1 ? null : idx + 1;
};

// Get long date format and 12 hour time format 
// Example: 2025-06-11 01:20:00 --> returns JUNE 11, 2025 (01:20 AM)
export const getDateTimeFormat = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("default", { month: 'long', day: 'numeric', year: 'numeric'}); 
  const formattedTime = date.toLocaleTimeString("default", { hour: '2-digit', minute: '2-digit'});
  return `${formattedDate} (${formattedTime})`;
}

// Returns an arry of months ["January", "February", ... "December"]
export const getMonths = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString('default', { month: 'long' })
);

// Get all weeks in a month
export const getAllWeeksInMonth = (monthName: string, year?: number) => {
  const targetYear = year || new Date().getFullYear()
  const monthIndex = new Date(`${monthName} 1, ${targetYear}`).getMonth()
  const weeks = []

  // Get first day of month and last day of month
  const firstDay = new Date(targetYear, monthIndex, 1)
  const lastDay = new Date(targetYear, monthIndex + 1, 0)

  // Calculate weeks for the month
  const firstWeek = getWeekNumber(firstDay.toISOString())
  const lastWeek = getWeekNumber(lastDay.toISOString())

  for (let week = firstWeek; week <= lastWeek; week++) {
    weeks.push(week)
  }

  return weeks
}

// Helper function to check if a week has passed
export const hasWeekPassed = (month: string, weekNo: number, year?: number) => {
  const currentDate = new Date()
  const targetYear = year || currentDate.getFullYear()
  const currentYear = currentDate.getFullYear()

  // Past year: all weeks have passed
  if (targetYear < currentYear) return true

  // Future year: no weeks have passed
  if (targetYear > currentYear) return false

  const monthNames = getMonths
  const monthIndex = monthNames.indexOf(month)

  if (monthIndex === -1) return false

  // Week N starts at (N - 1) * 7 days from day 1
  const weekStartDate = new Date(targetYear, monthIndex, 1 + (weekNo - 1) * 7)
  const weekEndDate = new Date(weekStartDate)
  weekEndDate.setDate(weekStartDate.getDate() + 6)

  return currentDate > weekEndDate
}

export const formatTableDate = (dateString: string | null | undefined): string => {
  if (!dateString || dateString === "N/A") return "N/A";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

