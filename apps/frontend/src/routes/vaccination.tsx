import path from "path";
import IndivVaccinationRecords from "@/pages/VACCINATION/RECORDS/indivVaccinationRecords";
import AllVaccinationRecords from "@/pages/VACCINATION/RECORDS/allVaccinationRecord";

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
