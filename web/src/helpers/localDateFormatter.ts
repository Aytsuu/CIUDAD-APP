export const localDateFormatter = (date: string | Date) => {
    const d = new Date(date);
    // These use LOCAL timezone values:
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}