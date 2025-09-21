import { VaccinationRecord } from "../../vaccination/tables/columns/types";

export type VaccineRecordsResponse = {
  success: boolean;
  data: MonthlyVaccineRecord[];
  total_records: number;

}


export type MonthlyVaccineRecord= {
  month: string;
  record_count: number;
  records: VaccinationRecord[];
  report: {
    staff_details: any;
    signature: string;
    control_no: string;
    office: string;
  };
}


export  type VaccineChartResponse ={
  success: boolean;
  month: string; // Could use template literal `${number}-${number}` if you want stricter month format
  vaccine_counts: {
    [vaccineName: string]: number; // Fully dynamic vaccine names with number counts
  };
  total_records: number;

}