
// Enhanced ordinal suffix function
export const getOrdinalSuffix = (num: number | undefined): string => {
  if (num === undefined || isNaN(num)) return "N/A";

  switch (num) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
};