export const formatTimestamp = (timestamp: string | Date): string => {
  const date = new Date(timestamp);

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',    
    day: '2-digit',     
    hour: '2-digit',    
    minute: '2-digit',
    second: '2-digit',
    hour12: true,       
  });
};
