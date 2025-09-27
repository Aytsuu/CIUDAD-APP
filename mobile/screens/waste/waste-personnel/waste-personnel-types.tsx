import { z } from "zod";

export interface TruckData {
  truck_id: string;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: "Operational" | "Maintenance";
  truck_last_maint: string;
  truck_is_archive?: boolean;
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
}

export interface Truck {
  truck_id: string;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: string;
  truck_last_maint: string;
  truck_is_archive?: boolean;
}

export const SearchFormSchema = z.object({
  searchQuery: z.string(),
});

export type SearchFormValues = z.infer<typeof SearchFormSchema>;

export type Role = "Driver Loader" | "Loader" | "Trucks";