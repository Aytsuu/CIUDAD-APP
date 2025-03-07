import path from "path";
import IndivVaccinationRecords from "@/pages/record/health/vaccination/IndivVaccinationRecords";
import AllVaccinationRecords from "@/pages/record/health/vaccination/AllVaccinationRecord";

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
