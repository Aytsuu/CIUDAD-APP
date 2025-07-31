export const isToday = (dateString: string) => {
  if (!dateString) return false;
  const today = new Date().toISOString().split("T")[0];
  const checkDate = dateString.split("T")[0];
  return today === checkDate;
};