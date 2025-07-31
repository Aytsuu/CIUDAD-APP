"use client"

import { api2 } from "@/api/api";
import axios from "axios";



export interface Service {
  service_id: number;
  service_name: string;
} 

export interface Day {
  day_id: number;
  day: string
  day_description: string
}

export interface SchedulerGetData {
	ss_id: number;
	service_name: string;
  day: string;
	meridiem: "AM" | "PM";
}


export const getService = async (): Promise<Service[]> => {
  try {
    const res = await api2.get("servicescheduler/services/");
    return res.data as Service[];
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

export const getDays = async (): Promise<Day[]> => {
  try {
    const res = await api2.get("servicescheduler/days/");
    return res.data as Day[];
  } catch (error) {
    console.error("Error fetching days:", error);
    throw error;
  }
}

export const getScheduler = async (): Promise<SchedulerGetData[]> => {
  try {
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


// export const getUniqueServices = async (): Promise<string[]> => {
//   try {
//     const services = await getServices();
//     // Extract unique service names
//     const uniqueServices = [...new Set(services.map(service => service.service))];
//     console.log("Unique services:", uniqueServices);
//     return uniqueServices;
//   } catch (error) {
//     console.error("Error getting unique services:", error);
//     throw error;
//   }
// };