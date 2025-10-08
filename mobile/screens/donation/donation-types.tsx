export type DonationInput = {
  don_num?: string;
  don_donor: string;
  don_item_name: string;
  don_qty: string;
  don_category: string;
  don_description?: string;
  don_date: string;
  don_status: any;
  don_dist_head?: any; 
  don_dist_date?: any;
  dist_staff_name?: any
};

export type Donation = {
  don_num: string;
  don_donor: string;
  don_item_name: string;
  don_qty: string;
  don_category: string;
  don_description?: string;
  don_date: string;
  per_id?: number | null;
  don_status: any;
  don_dist_head?: any; 
  don_dist_date?: any;
  dist_staff_name?: any
};

export type Personal = {
  per_id: number;
  full_name: string;
};

export type Donations = {
  don_num: string;
  don_donor: string;
  don_item_name: string;
  don_qty: string;
  don_category: string;
  don_description?: string;
  don_date: string;
  per_id?: number | null;
  don_status: "Stashed" | "Allotted";
  don_dist_head?: any; 
  don_dist_date?: any;
  dist_staff_name?: any
};

export type Staff = {
  staff_id: string;
  full_name: string;
  position_title?: string;
};