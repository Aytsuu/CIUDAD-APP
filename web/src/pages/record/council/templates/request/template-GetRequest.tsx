import {api} from "@/api/api";
import { parseFloatSafe } from '@/helpers/floatformatter';
import { capitalize } from "@/helpers/capitalize";
import { useState } from "react";


export const getTemplateRecord = async () => {
    try {

        const res = await api.get('council/template/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};


export const getPurposeRates = async () => {
    try {

        const res = await api.get('council/purpose-rates-view/');
        console.log("GETTTTT REQ PURPOSE: ", res)
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};