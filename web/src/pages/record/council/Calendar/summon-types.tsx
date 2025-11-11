

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
    staff_name: string;
    supp_docs: RemarkSuppDoc[];
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

export type CouncilMediationCalendarCase = {
    sc_id: string;
    sc_code: string;
    sc_mediation_status: string;
    sc_conciliation_status?: string | null;
    sc_date_marked: string;
    complainant_names: string[];
    accused_names: string[];
    incident_type: string;
    hearing_schedules: CouncilMediationHearingSchedule[];
}

export type CouncilMediationHearingSchedule = {
    hs_id: string;
    hs_level: string;
    hs_is_closed: boolean;
    summon_date: {
        sd_id: number;
        sd_date: string;
    };
    summon_time: {
        st_id: string | number;
        st_start_time: string;
    };
}

export type CouncilMediationEvent = {
  id: string; 
  title: string; 
  start: string; 
  end: string; 
  sc_code: string;
  complainant_names: string[];
  accused_names: string[];
  incident_type: string;
  hs_level: string;
  hearing_date: string; 
  hearing_time: string; 
};