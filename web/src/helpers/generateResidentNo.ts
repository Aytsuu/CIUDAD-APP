import { getResidents } from "@/pages/record/profiling/restful-api/profilingGetAPI";

export const generateResidentNo = async () => {
    const residents = await getResidents();
    const nextVal = residents.length + 1;
    const date = new Date();
    const [year, month, day] = [date.getFullYear() - 2000, date.getMonth() + 1, date.getDate()].map(String);

    const residentNo = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 5, useGrouping: false })
        .format(nextVal) + year + month.padStart(2, '0') + day.padStart(2, '0');

    return residentNo;
};