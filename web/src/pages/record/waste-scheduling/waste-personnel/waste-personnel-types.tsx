export type WasteTruck = {
  truck_id: number;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: string;
  truck_last_maint: string;
  truck_is_archive: boolean;
};

export type PersonnelCategory = "DRIVER LOADER" | "LOADER" | "Trucks";

export interface PersonnelItem {
  id: string;
  name: string;
  position: string;
  contact?: string;
}

export interface PersonnelData {
  "DRIVER LOADER": PersonnelItem[];
  "LOADER": PersonnelItem[];
  Trucks?: TruckData[];
}

export type TruckStatus = "Operational" | "Maintenance" | any;

export interface TruckData {
  truck_id: any;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: TruckStatus;
  truck_last_maint: string;
  truck_is_archive?: boolean;
  staff?: string;
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

export interface WastePersonnel {
  wstp_id: number;
  staff: Staff; 
}

export interface Trucks {
  truck_id: number;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: string;
  truck_last_maint: string;
  truck_is_archive?: boolean;
}

export interface TruckManagementProps {
  searchTerm: string;
  currentPage: number;
  pageSize: number;
}
