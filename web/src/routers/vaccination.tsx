import path from "path";
import IndivVaccinationRecords from "@/pages/healthServices/vaccination/tables/IndivVaccinationRecords";
import AllVaccinationRecords from "@/pages/healthServices/vaccination/tables/AllVaccinationRecord";
import VaccinationForm from "@/pages/healthServices/vaccination/NewVacRecForm";
import PatNewVacRecForm from "@/pages/healthServices/vaccination/PatNewVacRecForm";
import VaccinationView from "@/pages/healthServices/vaccination/DisplayVaccineInfo";
import UpdateVaccinationForm from "@/pages/healthServices/vaccination/UpdateVaccinationForm";
import UnvaccinaResident from "@/pages/healthServices/vaccination/tables/UnvaccineResidents";
import VaccinationManagement from "@/pages/healthServices/vaccination/tables/MainTable";

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
  },
  {
    path:"updateVaccinationForm",
    element:<UpdateVaccinationForm/>
  },
  {
    path:"UnvaccinaResident",
    element:<UnvaccinaResident/>
  },
  {
    path:"VaccinationManagement",
    element:<VaccinationManagement/>
  }


];