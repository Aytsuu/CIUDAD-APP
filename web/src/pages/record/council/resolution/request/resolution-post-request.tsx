import {api} from "@/api/api";
import { formatDate } from '@/helpers/dateHelper';
import { parseFloatSafe } from '@/helpers/floatformatter';
import { capitalize } from "@/helpers/capitalize";
import { useState } from "react";




export const resolution_create = async (resolutionInfo: Record<string, any>) => {
    try{
        let staff = "00004250624";

        console.log({
            res_title: resolutionInfo.res_title,
            res_date_approved: resolutionInfo.res_date_approved,
            res_area_of_focus: resolutionInfo.res_area_of_focus,
            res_is_archive: false,
            staff_id: Number(staff),
        })

        const res = await api.post('council/resolution/',{
            res_title: resolutionInfo.res_title,
            res_date_approved: resolutionInfo.res_date_approved,
            res_area_of_focus: resolutionInfo.res_area_of_focus,
            res_is_archive: false,
            staff_id: staff,
        })

        return res.data.res_num;
    }
    catch (err){
        console.error(err);
    }
}




export const resolution_file_create = async (data: {
  res_num: number;
  file_data: {
    name: string;
    type: string;
    file: any;
  };
}) => {
  try {
  
    const payload = {
      res_num: data.res_num,
      files: [{
        name: data.file_data.name,
        type: data.file_data.type,
        file: data.file_data.file 
      }]
    };

    console.log(payload)
    // const res = await api.post('council/resolution-file/', payload);
    // return res.data;
  } catch (err) {
    console.error(`Failed to create file ${data.file_data.name}:`, err);
    throw err;
  }
}