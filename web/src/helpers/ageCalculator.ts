export const calculateAge = (dateOfBirth: string): string => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    throw new Error('Invalid date of birth');
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  // Adjust for month difference and day of month
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  
  // Handle day difference for more precise month calculation
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  // Ensure months is positive after adjustment
  months = Math.max(0, months);

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} old`;
  }
  
  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} old`;
  }
  
  // For ages less than 1 month
  const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} old`;
  }
  
  return 'Newborn';
};