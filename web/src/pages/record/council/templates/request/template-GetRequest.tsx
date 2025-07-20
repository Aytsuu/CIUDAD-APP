import {api} from "@/api/api";
import { formatDate } from '@/helpers/dateFormatter';
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