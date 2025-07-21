export const formatSummonDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = date.getFullYear();
  
  // Add ordinal suffix to day
  const suffix = 
    day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
    day === 3 || day === 23 ? 'rd' : 'th';
  
  return `${day}${suffix} day of ${month} ${year}`;
};


export const formatSummonTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'afternoon' : 'morning';
  const displayHours = hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} O'CLOCK in the ${period}`;
};


export const formatSummonDateTime = (dateString: string, timeString: string): string => {
  return `${formatSummonDate(dateString)}, at ${formatSummonTime(timeString)}`;
};