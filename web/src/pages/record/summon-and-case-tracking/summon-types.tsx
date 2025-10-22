export type SummonCaseList = {
    sc_id: string;
    sc_code: string;
    complainant_names: string[];
    accused_names: string[];
    accused_addresses: string[],
    complainant_addresses: string[];
    complainant_rp_ids: string[],
    incident_type: string;
    sc_mediation_status: string;
    sc_conciliation_status?: string | null;
    decision_date: string;
    comp_id: string;
}

export type HearingMinutes = {
    hm_id: string;
    hm_name: string;
    hm_type: string;
    hm_path: string;
    hm_url: string;
}

export type RemarkSuppDoc = {
    rsd_id: string;
    rsd_name: string;
    rsd_type: string;
    rsd_path: string;
    rsd_url: string;
}

export type Remark = {
    rem_id: string;
    rem_remarks: string;
    rem_date: string;
    supp_docs: RemarkSuppDoc[];
}

export type SummonDates = {
    sd_id: number;
    sd_date: string;
}


export type SummonTimeSlots = {
    st_id: string | number;
    st_start_time: string;
    sd_id: string | number;
    st_is_booked?: boolean;
}

export type HearingSchedule = {
    hs_id: string;
    hs_level: string;
    hs_is_closed: boolean;
    summon_date: SummonDates;
    summon_time: SummonTimeSlots;
    remark: Remark;
    hearing_minutes: HearingMinutes[];
}

export type SummonCaseDetails = {
    sc_id: string;
    sc_code: string;
    sc_mediation_status: string;
    sc_conciliation_status?: string | null;
    sc_date_marked: string;
    sc_reason: string;
    comp_id: string;
    hearing_schedules: HearingSchedule[];
}

export type SupportingDoc = {
  ssd_id: number;
  ssd_name: string;
  ssd_type: string;
  ssd_path: string;
  ssd_url: string;
  ssd_upload_date: string; 
};

export type ScheduleList = {
    ss_id: string;
    ss_mediation_level: string;
    ss_is_rescheduled: boolean;
    ss_reason: string;
    hearing_date: string;
    hearing_time: string;
    supporting_docs: SupportingDoc[];
}