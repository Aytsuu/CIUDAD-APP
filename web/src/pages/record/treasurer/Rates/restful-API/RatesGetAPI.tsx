import { api } from "@/api/api"

export const getAnnualGrossSalesActive = async (page?: number, pageSize?: number, searchQuery?: string) => {
    try {
        const res = await api.get('treasurer/annual-gross-sales-active/', {
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

export const getAllAnnualGrossSales= async (page: number, pageSize: number, searchQuery: string) => {
    try {
        const res = await api.get('treasurer/all-annual-gross-sales/', {
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


export const getPurposeAndRate = async () => {
    try {
        const res = await api.get('treasurer/purpose-and-rate/');
        return res.data; 
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const getPurposeAndRatePersonalActive = async (page: number, pageSize: number, searchQuery: string) => {
    try {
        const res = await api.get('treasurer/purpose-and-rate-personal-active/', {
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

export const getPurposeAndRateAllPersonal = async (page: number, pageSize: number, searchQuery: string) => {
    try {
        const res = await api.get('treasurer/purpose-and-rate-all-personal/', {
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

export const getPurposeAndRateServiceChargeActive = async (page: number, pageSize: number, searchQuery: string) => {
    try {
        const res = await api.get('treasurer/purpose-and-rate-service-charge-active/', {
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

export const getPurposeAndRateAllServiceCharge = async (page: number, pageSize: number, searchQuery: string) => {
    try {
        const res = await api.get('treasurer/purpose-and-rate-all-service-charge/', {
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

export const getPurposeAndRateBarangayPermitActive = async (page: number, pageSize: number, searchQuery: string) => {
    try {
        const res = await api.get('treasurer/purpose-and-rate-barangay-permit-active/', {
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

export const getPurposeAndRateAllBarangayPermit = async (page: number, pageSize: number, searchQuery: string) => {
    try {
        const res = await api.get('treasurer/purpose-and-rate-all-barangay-permit/', {
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


