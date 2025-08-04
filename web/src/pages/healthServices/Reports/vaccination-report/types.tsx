import { VaccinationRecord } from "../../vaccination/tables/columns/types";
import { StaffDetails } from "../../childservices/viewrecords/types";

export interface VaccineRecordsResponse {
  success: boolean;
  data: MonthlyVaccineRecord[];
  total_records: number;

}


export interface MonthlyVaccineRecord {
  month: string;
  record_count: number;
  records: VaccinationRecord[];
  report: {
    staff_details: StaffDetails;
    signature: string;
    control_no: string;
    office: string;
  };
}