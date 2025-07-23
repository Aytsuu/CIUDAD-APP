import { api } from "@/api/api"

export const getAnnualGrossSales = async () => {
    try {
        const res = await api.get('treasurer/annual-gross-sales/');
        return res.data; 
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const getPurposeAndRate = async () => {
    try {
        const res = await api.get('treasurer/purpose-and-rate/');
        return res.data; 
    } catch (err) {
        console.error(err);
        throw err;
    }
};


