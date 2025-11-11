import { api } from "@/api/api";

export const getSummonCaseList = async (page: number, pageSize: number, searchQuery: string, statusFilter: string) => {
    try{
        const params: Record<string, any> = {
            page,
            page_size: pageSize,
            search: searchQuery,
        };
    
        if (statusFilter && statusFilter !== "All") {
                params.status = statusFilter;
        }

        const res = await api.get('clerk/summon-case-list/', {
            params
        })
        console.log(res.data)
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getCouncilCaseList = async (page: number, pageSize: number, searchQuery: string, statusFilter: string) => {
    try{
        const params: Record<string, any> = {
            page,
            page_size: pageSize,
            search: searchQuery,
        };
    
        if (statusFilter && statusFilter !== "All") {
                params.status = statusFilter;
        }

        const res = await api.get('clerk/council-case-list/', {
            params
        })
        console.log(res.data)
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getLuponCaseList = async (page: number, pageSize: number, searchQuery: string, statusFilter: string) => {
    try{
        const params: Record<string, any> = {
            page,
            page_size: pageSize,
            search: searchQuery,
        };
    
        if (statusFilter && statusFilter !== "All") {
                params.status = statusFilter;
        }

        const res = await api.get('clerk/lupon-case-list/', {
            params
        })
        console.log(res.data)
        return res.data
    }catch(err){
        console.error(err)
    }
}


export const getSummonCaseDetail = async (sc_id: string) => {
    try{
        const res = await api.get(`clerk/summon-case-detail/${sc_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getCouncilCaseDetail = async (sc_id: string) => {
    try{
        const res = await api.get(`clerk/council-case-detail/${sc_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getLuponCaseDetail = async (sc_id: string) => {
    try{
        const res = await api.get(`clerk/lupon-case-detail/${sc_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getSummonScheduleList = async (sc_id: string) => {
    try{
        const res = await api.get( `clerk/summon-schedule-list/${sc_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getSummonDates = async() => {
    try{
        const res = await api.get('clerk/summon-date-availability/')
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getSummonTimeSlots = async(sd_id: number) => {
    try{
        const res = await api.get(`clerk/summon-time-availability/${sd_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}


export const getComplaintDetails = async (comp_id: string) => {
    try{
        const res = await api.get(`/clerk/view-complaint/${comp_id}/`)

        return res.data
    }catch(err){
        console.error(err)
    }
}
