import path from "path";
import IndivVaccinationRecords from "@/pages/healthServices/vaccination/tables/individual/IndivVaccinationRecords";
import AllVaccinationRecords from "@/pages/healthServices/vaccination/tables/all/AllVaccinationRecord";
import PatNewVacRecForm from "@/pages/healthServices/vaccination/forms/NewVaccinationForm";
import VaccinationView from "@/pages/healthServices/vaccination/viewhistory/ViewVaccineHistory";
import UpdateVaccinationForm from "@/pages/healthServices/vaccination/forms/UpdateVaccinationForm";
import UnvaccinaResident from "@/pages/healthServices/vaccination/tables/all/UnvaccineResidents";
import VaccinationManagement from "@/pages/healthServices/vaccination/tables/all/MainTable";
import AgeGroupForm from "@/pages/healthServices/agegroup/AgeGroup";
import { AddAgeGroupForm } from "@/pages/healthServices/agegroup/AddAgeGroupForm";
import ScheduledVaccine from "@/pages/healthServices/vaccination/viewhistory/ScheduledVaccine";

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
    path:"vaccination-record-form",
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
  ,
  {
    path:"agegroup",
    element:<AgeGroupForm/>
  },
  {
    path:"age-group-management",
    element:<AddAgeGroupForm/>
  },
  {
    path: "scheduled-vaccine",
    element: <ScheduledVaccine />
  }

];