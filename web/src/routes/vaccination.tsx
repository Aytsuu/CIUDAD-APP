import path from "path";
<<<<<<< HEAD
import IndivVaccinationRecords from "@/pages/record/health/vaccination/indivVaccinationRecords";
import AllVaccinationRecords from "@/pages/record/health/vaccination/allVaccinationRecord";

export const vaccination = [
  {
    path: "/allVaccinationRecord",
    element: <AllVaccinationRecords />,
  },
  {
    path: "/invVaccinationRecord",
    element: <IndivVaccinationRecords />,
  },
=======
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

>>>>>>> master
];
