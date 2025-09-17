import IndivVaccinationRecords from "@/pages/healthServices/vaccination/tables/individual/IndivVaccinationRecords";
import AllVaccinationRecords from "@/pages/healthServices/vaccination/tables/all/AllVaccinationRecord";
import PatNewVacRecForm from "@/pages/healthServices/vaccination/forms/NewVaccinationForm";
import VaccinationView from "@/pages/healthServices/vaccination/viewhistory/ViewVaccineHistory";
import UnvaccinaResident from "@/pages/healthServices/vaccination/tables/all/UnvaccineResidents";
import VaccinationManagement from "@/pages/healthServices/vaccination/tables/all/MainTable";
import AgeGroup from "@/pages/healthServices/agegroup/AgeGroup";
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
    path:"UnvaccinaResident",
    element:<UnvaccinaResident/>
  },
  {
    path:"VaccinationManagement",
    element:<VaccinationManagement/>
  }
  ,
  {
    path:"age-group",
    element:<AgeGroup/>
  },
 
  {
    path: "scheduled-vaccine",
    element: <ScheduledVaccine />
  },



];