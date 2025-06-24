// Format date (YYYY-MM-DD)
export const formatDate = (date: string | Date) => {
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

// Helper function to get all weeks in a month
export const getAllWeeksInMonth = (monthName: string) => {
  const currentYear = new Date().getFullYear();
  const monthIndex = new Date(`${monthName} 1, ${currentYear}`).getMonth();
  const weeks = [];
  
  // Get first day of month and last day of month
  const firstDay = new Date(currentYear, monthIndex, 1);
  const lastDay = new Date(currentYear, monthIndex + 1, 0);
  
  // Calculate weeks for the month
  const firstWeek = getWeekNumber(firstDay.toISOString());
  const lastWeek = getWeekNumber(lastDay.toISOString());
  
  for (let week = firstWeek; week <= lastWeek; week++) {
    weeks.push(week);
  }
  
  return weeks;
};