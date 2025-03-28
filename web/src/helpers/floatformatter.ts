export const parseFloatSafe = (value: string | number): number => {
    const parsed = parseFloat(value as string);
    return isNaN(parsed) ? 0.00 : parseFloat(parsed.toFixed(2));
};