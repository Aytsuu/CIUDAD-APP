"use client"

import { api2 } from "@/api/api";
import axios from "axios";


export const updateScheduler = async (ssId: number, meridiem: "AM" | "PM") => {
    try {
        const res = await api2.put(`servicescheduler/service-scheduler/${ssId}/update`, {meridiem:meridiem});
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Updating scheduler error: ", error.response?.data || error.message);
        } else {
            console.error("Unexpected Error: ", error);
        }
    }
}