export const capitalize = (str: string | null): string | null => {
    if (!str) return null;
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};