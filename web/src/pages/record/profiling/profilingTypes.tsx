
export type ResidentRecord = {
  rp_id: string;
  household_noe: string;
  family_no: string;
  sitio_name: string;
  lname: string;
  fname: string;
  mname: string;
  suffix: string;
  rp_date_registered: string;
  registered_by: string;
  has_account: boolean;
};

export type ResidentAdditionalRecord = {
  rp_id: string;
  fc_role: string;
  name: string;
  sex: string;
  dob: string;
  status: string;
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
}

export type MemberRecord = {
  data: Record<string, any>;
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
  data: React.ReactNode
}

export type SitioRecord = {
  sitio_id: string;
  sitio_name: string;
}

export type RequestRecord = {
  id: string;
  lname: string;
  fname: string;
  mname: string;
  suffix: string;
  requestDate: string;
}

export type BusinessRecord = {
  id: string;
  name: string;
  grossSales: string;
  sitio: string;
  street: string;
  respondent: string;
  dateRegistered: string;
  registeredBy: string;
}

