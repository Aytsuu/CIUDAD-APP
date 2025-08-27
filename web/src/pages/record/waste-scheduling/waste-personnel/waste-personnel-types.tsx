export type WasteTruck = {
  truck_id: number;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: string;
  truck_last_maint: string;
  truck_is_archive: boolean;
};

export type PersonnelCategory = "Watchman" | "Waste Driver" | "Waste Collector" | "Trucks";

export interface PersonnelItem {
  id: string;
  name: string;
  position: string;
  contact?: string;
}

export interface PersonnelData {
  Watchman: PersonnelItem[];
  "Waste Driver": PersonnelItem[];
  "Waste Collector": PersonnelItem[];
  Trucks?: TruckData[];
}

export type TruckStatus = "Operational" | "Maintenance";

export interface TruckData {
  truck_id: string;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: TruckStatus;
  truck_last_maint: string;
  truck_is_archive?: boolean;
}

export interface Personal {
  per_id: number;
  lname: string; 
  fname: string;
  mname: string | null;
  suffix: string | null;
  dob: string; 
  sex: string;
  status: string;
  address: string; 
  education: string | null;
  religion: string;
  contact: string;
}

export interface Position {
  pos_id: number;
  title: string;
  max: number;
}

export interface ResidentProfile {
  rp_id: string;
  rp_date_registered: string; 
  personal: Personal; 
}

export interface Staff {
  staff_id: string;
  assign_date: string; 
  profile: ResidentProfile; 
  position: Position; 
  manager?: Staff | null;
}

export interface WastePersonnel {
  wstp_id: number;
  staff: Staff; 
}

export interface Truck {
  truck_id: number;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: string;
  truck_last_maint: string;
  truck_is_archive?: boolean;
}