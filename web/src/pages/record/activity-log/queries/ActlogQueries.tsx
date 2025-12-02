export interface ActivityLog {
    act_id: number;
    act_timestamp: string;
    act_type: string;
    act_description: string;
    feat: number | null;
    staff: number | null;
    staff_name: string;
    staff_profile_image: string | null;
    act_module: string;
    act_action: string;
    act_record_id: string;
}

export interface ActivityLogResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ActivityLog[];
}

