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

export const getPurposeAndRatePersonal = async (page: number, pageSize: number, searchQuery: string) => {
    try {
        const res = await api.get('treasurer/purpose-and-rate-personal/', {
            params: {
                page,
                page_size: pageSize,
                search: searchQuery
            }
        });
        return res.data; 
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const getPurposeAndRateServiceCharge = async (page: number, pageSize: number, searchQuery: string) => {
    try {
        const res = await api.get('treasurer/purpose-and-rate-service-charge/', {
            params: {
                page,
                page_size: pageSize,
                search: searchQuery
            }
        });
        return res.data; 
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const getPurposeAndRateBusinessPermit = async (page: number, pageSize: number, searchQuery: string) => {
    try {
        const res = await api.get('treasurer/purpose-and-rate-business-permit/', {
            params: {
                page,
                page_size: pageSize,
                search: searchQuery
            }
        });
        return res.data; 
    } catch (err) {
        console.error(err);
        throw err;
    }
};


