export const formatTimestampToDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  
  // Validate the date
  if (isNaN(date.getTime())) {
    throw new Error('Invalid timestamp provided');
  }

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = date.getFullYear();
  
  const suffix = 
    day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
    day === 3 || day === 23 ? 'rd' : 'th';
  
  return `${day}${suffix} day of ${month} ${year}`;
};

// You can add other date formatting functions here as needed
export const formatDateForSummon = (date: Date): string => {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = date.getFullYear();
  
  const suffix = 
    day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
    day === 3 || day === 23 ? 'rd' : 'th';
  
  return `${day}${suffix} day of ${month} ${year}`;
};