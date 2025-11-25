export enum User {
  admin = "ADMIN",
  resident = "RESIDENT",
  brgyStaff = "BARANGAY STAFF",
  healthStaff = "HEALTH STAFF",
}

export enum Feature {
  // BARANGAY
  profiling = "PROFILING",
  report = "REPORT",
  complaint = "COMPLAINT",
  gad = "GAD",
  finance = "FINANCE",
  council = "COUNCIL",
  certificateAndClearances = "CERTIFICATE & CLEARANCES",
  donation = "DONATION",
  waste = "WASTE",
  summonRemarks = "SUMMON REMARKS",
  conciliationProceedings = "CONCILIATION PROCEEDINGS",
  councilMediation = "COUNCIL MEDIATION",

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