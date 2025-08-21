
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
  rp_date_registered: string;
  registered_by: string;
  has_account: boolean;
};

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
  sitio: string;
  bus_street: string;
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
  per_edAttainment: string;
  per_religion: string;
  addresses: Record<string, any>[];
  files: Record<string, any>[]
  req_date: string;
}

export type FamilyRequestRecord = {
  req_id: string;
  respondent: Record<string, any>;
  compositions: Record<string, any>[];
  req_date: string;
}

export type BusinessRecord = {
  bus_id: string;
  bus_name: string;
  bus_gross_sales: string;
  sitio: string;
  bus_street: string;
  bus_date_of_registration: string;
  bus_date_verified: string;
  rp: string;
}

export type BusinessRespondent = {
  br_id: string;
  lname: string;
  fname: string;
  mname: string;
  suffix: string;
  sex: string;
  br_date_registered: string;
  businesses: Record<string, any>[];
}

