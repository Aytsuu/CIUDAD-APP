export const capitalize = (str: string | null): string | null => {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const capitalizeAllFields = (data: any) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (typeof value === 'string') {
          return [key, capitalize(value)]; // Capitalize string values
        }
        return [key, value]; // Leave non-string values unchanged
      })
    );
};