import path from "path";
import IndivVaccinationRecords from "@/pages/healthServices/vaccination/IndivVaccinationRecords";
import AllVaccinationRecords from "@/pages/healthServices/vaccination/AllVaccinationRecord";

export const vaccination = [
  {
    path: "invVaccinationRecord",
    element: <IndivVaccinationRecords/>,
  },
  {
    path: "allRecordsForVaccine",
    element: <AllVaccinationRecords/>,
  },

];
