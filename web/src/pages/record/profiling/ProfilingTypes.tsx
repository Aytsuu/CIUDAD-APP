
export type AllRecordCombined = {
  id: string;
  lname: string;
  fname: string;
  mname: string;
  suffix: string;
  sex: string;
  date_registered: string;
  family_no: string;
  type: string;
}

export type ResidentRecord = {
  rp_id: string;
  household_no: string;
  family_no: string;
  business_owner: boolean;
  sitio_name: string;
  lname: string;
  fname: string;
  mname: string;
  suffix: string;
  sex: string;
  dob: string;
  pwd: string;
  voter: "Yes" | "No" | "Link" | "Review";
  registered_by: string;
  has_account: boolean;
};

export type VoterRecord = {
  voter_id: string;
  voter_name: string;
  voter_address: string;
  voter_precinct: string;
  voter_category: string;
}

export type ResidentFamilyRecord = {
  rp_id: string;
  fc_role: string;
  name: string;
  sex: string;
  dob: string;
  status: string;
}

export type ResidentBusinessRecord = {
  bus_id: string;
  bus_name: string;
  bus_gross_sales: string;
  bus_date_verified: string;
  bus_location: string;
}

export type DependentRecord = {
  id: string;
  lname: string;
  fname: string;
  mname: string;
  suffix: string;
  sex: string;
  dateOfBirth: string;
  // headRelationship: string
}

export type FamilyRecord = {
  fam_id: string;
  members: string;
  fam_building: string;
  mother: string;
  father: string;
  guardian: string;
  fam_date_registered: string;
  registered_by: string;
}

export type MemberRecord = {
  dob: string
  fc_role: string
  name: string
  rp_id: string
  sex: string
  status: string
}

export type HouseholdRecord = {
  hh_id: string;
  total_families: string;
  street: string;
  sitio: string;
  nhts: string;
  head: string;
  head_id: string;
  date_registered: string;
  registered_by: string;
}

export type HouseholdFamRecord = {
  fam_id: string
  fam_building: string
  total_members: string
  fam_indigenous: string
  fam_date_registered: string
  registered_by: string
}

export type SitioRecord = {
  sitio_id: string;
  sitio_name: string;
}

export type IndividualRequestRecord = {
  req_id: string;
  per_id: string;
  per_lname: string;
  per_fname: string;
  per_mname: string;
  per_suffix: string;
  per_sex: string;
  per_dob: string;
  per_status: string;
  per_contact: string;
  per_disability: string;
  per_edAttainment: string;
  per_religion: string;
  per_addresses: Record<string, any>[];
  req_created_at: string;
}

export type FamilyRequestRecord = {
  req_id: string;
  respondent: Record<string, any>;
  compositions: Record<string, any>[];
  req_created_at: string;
}

export type BusinessRecord = {
  bus_id: string;
  bus_name: string;
  bus_gross_sales: string;
  sitio: string;
  bus_street: string;
  respondent: string;
  bus_date_of_registration: string;
  bus_date_verified: string;
  rp: string;
  br: string;
}

export type BusinessRespondent = {
  br_id: string;
  br_lname: string;
  br_fname: string;
  br_mname: string;
  br_sex: string;
  br_dob: string;
  br_date_registered: string;
  businesses: Record<string, any>[];
}

