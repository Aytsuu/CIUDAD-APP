import path from "path";
import IndivVaccinationRecords from "@/pages/healthServices/vaccination/IndivVaccinationRecords";
import AllVaccinationRecords from "@/pages/healthServices/vaccination/AllVaccinationRecord";
import VaccinationForm from "@/pages/healthServices/vaccination/VaccinationForm";
export const vaccination = [
  {
    path: "invVaccinationRecord",
    element: <IndivVaccinationRecords/>,
  },
  {
    path: "allRecordsForVaccine",
    element: <AllVaccinationRecords/>,
  },

  {
    path:"vaccinationForm",
    element:<VaccinationForm/>
  }

];