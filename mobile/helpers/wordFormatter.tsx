export const formatAreaOfFocus = (area: string) => {
  if (area.toLowerCase() === 'gad') {
    return 'GAD'; 
  }
  return area.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};