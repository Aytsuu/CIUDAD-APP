import IndivVaccinationRecords from "@/pages/healthServices/vaccination/tables/individual/IndivVaccinationRecords";
import PatNewVacRecForm from "@/pages/healthServices/vaccination/forms/NewVaccinationForm";
import VaccinationView from "@/pages/healthServices/vaccination/viewhistory/ViewVaccineHistory";
import VaccinationManagement from "@/pages/healthServices/vaccination/tables/all/MainTable";
import AgeGroup from "@/pages/healthServices/agegroup/AgeGroup";
import ScheduledVaccine from "@/pages/healthServices/vaccination/viewhistory/ScheduledVaccine";
export const vaccination = [
  {
    path: "/services/vaccination/records",
    element: <IndivVaccinationRecords/>,
  },
  {
    path:"/services/vaccination/form",
    element:<PatNewVacRecForm/>
  },
  {
    path:"/services/vaccination/records/history",
    element:<VaccinationView/>
  },
  {
    path:"/services/vaccination",
    element:<VaccinationManagement/>
  },
  {
    path:"age-group",
    element:<AgeGroup/>
  },
 
  {
    path: "scheduled-vaccine",
    element: <ScheduledVaccine />
  },



];