import path from "path";
import IndivVaccinationRecords from "@/pages/healthServices/vaccination/IndivVaccinationRecords";
import AllVaccinationRecords from "@/pages/healthServices/vaccination/AllVaccinationRecord";
import VaccinationForm from "@/pages/healthServices/vaccination/NewVacRecForm";
import PatNewVacRecForm from "@/pages/healthServices/vaccination/PatNewVacRecForm";
import VaccinationView from "@/pages/healthServices/vaccination/DisplayVaccineInfo";
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
  },
  {
    path:"patNewVacRecForm",
    element:<PatNewVacRecForm/>
  },
  {
    path:"vaccinationView",
    element:<VaccinationView/>
  }


];