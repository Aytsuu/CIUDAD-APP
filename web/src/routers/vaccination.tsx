import IndivVaccinationRecords from "@/pages/healthServices/vaccination/tables/individual/IndivVaccinationRecords";
import PatNewVacRecForm from "@/pages/healthServices/vaccination/forms/NewVaccinationForm";
import VaccinationView from "@/pages/healthServices/vaccination/viewhistory/ViewVaccineHistory";
// import AgeGroup from "@/pages/healthServices/agegroup/AgeGroup";
import ScheduledVaccine from "@/pages/healthServices/vaccination/viewhistory/ScheduledVaccine";
import { ResidentListSection } from "@/pages/healthServices/vaccination/tables/all/ResidentListDialog";
import AllVaccinationRecords from "@/pages/healthServices/vaccination/tables/all/AllVaccinationRecord";
import UnvaccinatedResidents from "@/pages/healthServices/vaccination/tables/all/UnvaccineResidents";
import path from "path";

export const vaccination = [
  {
    path: "/services/vaccination/records",
    element: <IndivVaccinationRecords />
  },
  {
    path: "/services/vaccination/form",
    element: <PatNewVacRecForm />
  },
  {
    path: "/services/vaccination/records/history",
    element: <VaccinationView />
  },
  {
    path: "/services/vaccination",
    element: <AllVaccinationRecords />
  },
  {
    path:"services/vaccination/resident-tracking",
    element:<UnvaccinatedResidents/>
  },

  // {
  //   path: "age-group",
  //   element: <AgeGroup />
  // },
  {
    path: "scheduled-vaccine",
    element: <ScheduledVaccine />
  },
  {
    path: "/services/vaccination/resident-list",
    element: <ResidentListSection />
  }

];
