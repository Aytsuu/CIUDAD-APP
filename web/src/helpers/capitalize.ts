export const capitalize = (str: any) => {
    if (!str) return null;
    return str
        .toLowerCase()
        .split(' ')
        .map((word:any) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const capitalizeAllFields = (data: any) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (typeof value === 'string') {
          return [key, capitalize(value)];
        }
        return [key, value]; 
      })
    );
};    


