"use client"

import { api2 } from "@/api/api";
import axios from "axios";


export interface ServicePostData {
	service_name: string;
}

export interface DayPostData {
	day:string;
	day_description?: string | "";
}

export interface SchedulerPostData {
	service_name: string;
	day: string;
	meridiem: "AM" | "PM";
	day_description?: string | "";
}

export interface SchedulerUpdateData extends SchedulerPostData {
	ss_id: number;
}

export const  addService = async (data: ServicePostData) => {
	try {
		const res = await api2.post("servicescheduler/services/", data);
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error("Service Creation Error: ", error.response?.data || error.message);
		} else {
			console.error("Unexpected Error: ", error);
		}
		throw error;
	}
}

export const addDay = async (data: DayPostData) => {
	try {
		const res = await api2.post("servicescheduler/days/", data);
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error("Day Creation Error: ", error.response?.data || error.message);
		} else {
			console.error("Unexpected Error: ", error);
		}
		throw error;
	}
}

export const addScheduler= async (data: SchedulerPostData) => {
	try {
		console.log("Sending scheduler data to API: ", data);
		const res = await api2.post("servicescheduler/service-scheduler/create/", data);

		return res.data.ss_id
	} catch (error) {
		if(axios.isAxiosError(error)) {
			console.error("Scheduler Error: ", error.response?.data || error.message);
		} else {
			console.error("Unexpected Error: ", error);
		}
		throw error;
	}
}