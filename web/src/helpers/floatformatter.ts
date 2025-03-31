export const parseFloatSafe = (value: string | number): number => {
    if (value === null || value === undefined || value === '') {
        return 0.00;
    }
    const parsed = parseFloat(value as string);
    return isNaN(parsed) ? 0.00 : parseFloat(parsed.toFixed(2));
};