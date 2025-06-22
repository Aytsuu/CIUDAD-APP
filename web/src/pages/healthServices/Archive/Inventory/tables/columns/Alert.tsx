// Updated helper functions with proper date comparison
export const isNearExpiry = (expiryDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  oneMonthFromNow.setHours(0, 0, 0, 0);

  return expiry > today && expiry <= oneMonthFromNow;
};

export const isExpired = (expiryDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  return expiry <= today; 
};

export const isLowStock = (availQty: number, unit: string, pcs: number) => {
    if (availQty <= 0) {
      return false; 
    }
  
    if (unit.toLowerCase() === 'boxes') {
      const boxCount = Math.ceil(availQty / pcs);
      return boxCount <= 2 && pcs > 0;
    }
    return availQty <= 10; 
  };