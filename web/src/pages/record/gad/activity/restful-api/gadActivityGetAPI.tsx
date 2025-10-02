import { api } from "@/api/api";

// Get all GAD activity data for calendar display
export const getGADActivityData = async () => {
    try {
        const response = await api.get('/gad/activity/data');
        return response.data;
    } catch (error) {
        console.error('Error fetching GAD activity data:', error);
        throw error;
    }
};

// Get filtered annual development plans with project proposals
export const getFilteredAnnualDevPlans = async (year: number) => {
    try {
        const response = await api.get(`/gad/activity/annual-dev-plans/${year}/filtered`);
        return response.data;
    } catch (error) {
        console.error('Error fetching filtered annual dev plans:', error);
        throw error;
    }
};

// Get calendar events data
export const getCalendarEventsData = async () => {
    try {
        const response = await api.get('/gad/activity/calendar-events');
        return response.data;
    } catch (error) {
        console.error('Error fetching calendar events data:', error);
        throw error;
    }
};

// Get waste events data
export const getWasteEventsData = async () => {
    try {
        const response = await api.get('/gad/activity/waste-events');
        return response.data;
    } catch (error) {
        console.error('Error fetching waste events data:', error);
        throw error;
    }
};

// Get council events data
export const getCouncilEventsData = async () => {
    try {
        const response = await api.get('/gad/activity/council-events');
        return response.data;
    } catch (error) {
        console.error('Error fetching council events data:', error);
        throw error;
    }
};

// Get hotspot data
export const getHotspotData = async () => {
    try {
        const response = await api.get('/gad/activity/hotspot-data');
        return response.data;
    } catch (error) {
        console.error('Error fetching hotspot data:', error);
        throw error;
    }
};

// Get waste collection data
export const getWasteCollectionData = async () => {
    try {
        const response = await api.get('/gad/activity/waste-collection-data');
        return response.data;
    } catch (error) {
        console.error('Error fetching waste collection data:', error);
        throw error;
    }
};

// Get project proposals data
export const getProjectProposalsData = async () => {
    try {
        const response = await api.get('/gad/activity/project-proposals');
        return response.data;
    } catch (error) {
        console.error('Error fetching project proposals data:', error);
        throw error;
    }
};
