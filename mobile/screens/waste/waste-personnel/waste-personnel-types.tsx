import { z } from "zod";

export interface TruckData {
  truck_id: any;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: "Operational" | "Maintenance";
  truck_last_maint: string;
  truck_is_archive?: boolean;
  staff?: any;
  truck_track_device?: string | null;
  truck_track_device_lat?: number | null;
  truck_track_device_lng?: number | null;
}

export interface PersonnelItem {
  id: string;
  name: string;
  position: string;
  contact?: string;
}

export interface TruckFormValues {
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: "Operational" | "Maintenance";
  truck_last_maint: string;
  staff?: any;
  truck_track_device?: string | null;
  truck_track_device_lat?: number | null;
  truck_track_device_lng?: number | null;
}

export const SearchFormSchema = z.object({
  searchQuery: z.string(),
});

export type SearchFormValues = z.infer<typeof SearchFormSchema>;

export type Role = "DRIVER LOADER" | "LOADER" | "Trucks";

export interface WastePersonnel {
  wstp_id: number;
  staff: Staff; 
}

export interface Position {
  pos_id: number;
  pos_title: string;
  pos_max: number;
}

export interface ResidentProfile {
  rp_id: string;
  rp_date_registered: string; 
  per: Personal; 
}

export interface Staff {
  staff_id: string;
  assign_date: string; 
  rp: ResidentProfile; 
  pos: Position;  
  manager?: Staff | null;
  profile?: any
}

export interface Personal {
  per_id: number;
  per_lname: string; 
  per_fname: string;
  per_mname: string | null;
  per_suffix: string | null;
  per_dob: string; 
  per_sex: string;
  per_status: string;
  per_contact: string;
}

export interface Trucks {
  truck_id: any;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: "Operational" | "Maintenance";
  truck_last_maint: string;
  truck_is_archive?: boolean;
  truck_track_device?: string | null;
  truck_track_device_lat?: number | null;
  truck_track_device_lng?: number | null;
}