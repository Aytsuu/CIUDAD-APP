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
  don_donorfname: string; 
  don_donorlname: string;
  don_item_name: string;
  don_qty: number;
  don_category: string;
  don_receiver: string;
  don_description?: string;
  don_date: string;
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
};

export type Personal = {
  per_id: number;
  full_name: string;
};

export interface ClerkDonateCreateFormProps {
  onSuccess?: () => void;
}

export type ClerkDonateViewProps = {
  don_num: string;
  onSaveSuccess?: () => void;
};