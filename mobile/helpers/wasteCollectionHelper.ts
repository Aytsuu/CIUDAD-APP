// helpers/wasteCollectionHelpers.ts

// Define day order for sorting
const dayOrder = {
  "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4,
  "Friday": 5, "Saturday": 6, "Sunday": 7
};

// Sort waste collection data by day and time
export const sortWasteCollectionData = (data: any[]) => {
  return [...data].sort((a, b) => {
    const dayA = dayOrder[a.wc_day as keyof typeof dayOrder] || 8;
    const dayB = dayOrder[b.wc_day as keyof typeof dayOrder] || 8;
    
    if (dayA !== dayB) return dayA - dayB;
    return a.wc_time.localeCompare(b.wc_time);
  });
};

// Filter data by sitio
export const filterBySitio = (data: any[], selectedSitio: string) => {
  return selectedSitio === "0" 
    ? data 
    : data.filter(item => item.sitio_name === selectedSitio);
};