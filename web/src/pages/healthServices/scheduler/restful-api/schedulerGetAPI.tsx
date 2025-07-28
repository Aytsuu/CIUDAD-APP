"use client"

import { api2 } from "@/api/api";
import axios from "axios";

export interface SchedulerGetData {
	ss_id: number;
	service: string;
	meridiem: "AM" | "PM";
}

export const getServices = async (): Promise<SchedulerGetData[]> => {
  try {
    console.log("Fetching services from API...");
    const res = await api2.get("servicescheduler/service-scheduler/");
    
    console.log("Services fetched:", res.data);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Services fetch error: ", error.response?.data || error.message);
    } else {
      console.error("Unexpected Error: ", error);
    }
    throw error;
  }
};


export const getUniqueServices = async (): Promise<string[]> => {
  try {
    const services = await getServices();
    // Extract unique service names
    const uniqueServices = [...new Set(services.map(service => service.service))];
    console.log("Unique services:", uniqueServices);
    return uniqueServices;
  } catch (error) {
    console.error("Error getting unique services:", error);
    throw error;
  }
};