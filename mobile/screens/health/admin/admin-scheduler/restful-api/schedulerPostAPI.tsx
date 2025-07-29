"use client"

import { api2 } from "@/api/api";
import axios from "axios";


export interface SchedulerPostData {
	service: string;
	meridiem: "AM" | "PM";
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