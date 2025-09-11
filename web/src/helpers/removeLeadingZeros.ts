// Helper function to remove leading zeros
export const removeLeadingZeros = (value: number | string): number => {
  return Number(String(value).replace(/^0+/, ""));
};