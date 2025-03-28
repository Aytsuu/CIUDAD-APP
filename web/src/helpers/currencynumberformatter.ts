export const formatNumber = (value: string | number) => {
    return `₱ ${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};