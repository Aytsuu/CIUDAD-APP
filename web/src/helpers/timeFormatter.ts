export const formatTime = (timeStr: string): string => {

  const [hours, minutes] = timeStr.split(':').map(Number);

  const date = new Date();
  date.setHours(hours, minutes);

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
