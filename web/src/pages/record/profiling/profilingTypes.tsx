
// Define the type for the Report object
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
};

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
  id: string;
  noOfMembers: string;
  building: string;
  indigenous: string;
  dateRegistered: string;
  registeredBy: string;
}

export type MemberRecord = {
  data: Record<string, any>;
}

export type HouseholdRecord = {
  id: string;
  families: string;
  streetAddress: string;
  sitio: string;
  nhts: string;
  headNo: string;
  head: string;
  dateRegistered: string;
  registeredBy: string;
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