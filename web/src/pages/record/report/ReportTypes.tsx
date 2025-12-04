// Define the type for the Report object

export type IRReport = {
  ir_id: string;
  ir_area: string;
  ir_involved: string;
  ir_add_details: string;
  ir_type: string;
  ir_created_at: string;
  ir_reported_by: string;
  ir_severity: string;
  ir_time: string;
  ir_date: string;
  ir_status: string;
  ir_is_tracker: boolean;
  ir_track_lat: number;
  ir_track_lng: number;
}

export type ARReport = {
  id: string;
  ar_title: string;
  ar_sitio: string;
  ar_street: string;
  date: string;
  ar_files: any;
  status: string;
}