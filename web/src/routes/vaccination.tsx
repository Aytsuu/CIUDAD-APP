import path from "path";
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
];
