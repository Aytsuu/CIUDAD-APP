export interface PaymentResponse {
  checkout_url: string;
  payment_intent_id: string;
  [key: string]: any; // For any additional properties
}

export interface PaymentStatusResponse {
  status: string;
  paid: boolean;
  amount?: number;
  payment_method?: string;
}

export type DonationInput = {
  don_num?: string;
  don_donor: string;
  don_item_name: string;
  don_qty: string;
  don_category: string;
  don_description?: string;
  don_date: string;
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
};

export type Personal = {
  per_id: number;
  full_name: string;
};