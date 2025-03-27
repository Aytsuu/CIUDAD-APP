// Define the type for the Report object
export type ResidentRecord = {
  id: string;
  householdNo: string;
  familyNo: string;
  sitio: string;
  lname: string;
  fname: string;
  mname: string;
  suffix: string;
  dateRegistered: string;
  registeredBy: string;
};

export type DependentRecord = {
  id: string
  lname: string
  fname: string
  mname: string
  suffix: string
  sex: string
  dateOfBirth: string
  // headRelationship: string
}

export type FamilyRecord = {
  id: string
  head: string
  noOfDependents: string
  building: string
  indigenous: string
  dateRegistered: string
  registeredBy: string
}

export type HouseholdRecord = {
  id: string,
  streetAddress: string,
  sitio: string,
  nhts: string,
  headNo: string,
  head: string,
  dateRegistered: string,
  registeredBy: string
}

export type SitioRecord = {
  sitio_id: string,
  sitio_name: string
}