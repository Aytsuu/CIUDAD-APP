// Define the type for the Report object
export type ResidentRecord = {
  id: string;
  householdNo: string;
  familyNo: string;
  sitio: string;
  lastName: string;
  firstName: string;
  mi: string;
  suffix: string;
  dateRegistered: string;
  // Add registered by
};

export type HouseholdRecord = {
  id: string,
  address: string,
  head: string,
  dateRegistered: string,
  registeredBy: string
}