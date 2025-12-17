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


export const getService = async (): Promise<Service[] | undefined> => {
  try {
    const res = await api2.get("servicescheduler/services/");
    return res.data as Service[];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching services:", error);
    }
  }
}

export const getDays = async (): Promise<Day[] | undefined> => {
  try {
    const res = await api2.get("servicescheduler/days/");
    return res.data as Day[];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching days:", error);
    }
  }
}

export const getScheduler = async (): Promise<SchedulerGetData[] | undefined> => {
  try {
    const res = await api2.get("servicescheduler/service-scheduler/");
    
    return res.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      if (axios.isAxiosError(error)) {
        console.error("Services fetch error: ", error.response?.data || error.message);
      } else {
        console.error("Unexpected Error: ", error);
      }
    }
  }
};

