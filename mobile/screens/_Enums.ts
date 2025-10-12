export enum User {
  admin = "ADMIN",
  resident = "RESIDENT",
  brgyStaff = "BARANGAY STAFF",
  healthStaff = "HEALTH STAFF"
}

export enum Feature {
  // BARANGAY
  profiling = "PROFILING",
  report = "REPORT",
  complaint = "COMPLAINT",
  gad = "GAD",
  finance = "FINANCE",
  summonAndCaseTracker = "SUMMON AND CASE TRACKER",
  council = "COUNCIL",
  certificateAndClearances = "CERTIFICATE AND CLEARANCES",
  donation = "DONATION",
  waste = "WASTE",

  // HEALTH
  patientRecords = "PATIENT RECORDS",
  referredPatients = "REFERRED PATIENTS",
  forwardedRecords = "FORWARDED RECORDS",
  inventory = "INVENTORY",
  reports = "REPORTS",
  serviceScheduler = "SERVICE SCHEDULER",
  followUpVisits = "FOLLOW-UP VISITS",
  services = "SERVICES"
}