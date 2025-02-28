import path from "path";
import IndivVaccinationRecords from "@/pages/vaccination/RECORDS/indivVaccinationRecords";
import AllVaccinationRecords from "@/pages/vaccination/RECORDS/allVaccinationRecord";

export const vaccination = [
  {
    path: "/allVaccinationRecord",
    element: <AllVaccinationRecords />,
  },
  {
    path: "/invVaccinationRecord",
    element: <IndivVaccinationRecords />,
  },
];
