import ForwardedVaccinationForm from "@/pages/healthServices/forwardedrecord/forwardedrecords/Step2Vaccination";
import MainForwardedRecord from "@/pages/healthServices/forwardedrecord/Main";
import path from "path";
import ForwardedCHimmunization from "@/pages/healthServices/forwardedrecord/forwardedrecords/ChildImmunization";
import  PendingConsultationRecord  from "@/pages/healthServices/forwardedrecord/forwardedrecords/forwardedMedicalConsultation";
import ChildHealthCheckupHistory from "@/pages/healthServices/forwardedrecord/forwardedrecords/ForwardedhildMedicalCon";
import CombinedHealthRecordsTable from "@/pages/healthServices/forwardedrecord/forwardedrecords/CombineConsultation";
import ScheduledVaccinations from "@/pages/healthServices/forwardedrecord/forwardedrecords/ScheduledVaccinations";

export const forwardedhealthrecord_router = [
  // {
  //   path: "/forwarded-vaccination-records",
  //   element: <ForwardedVaccinationRecords />,
  // },
  {
    path: "/main-forwarded-records/forwarded-vaccination-form",
    element: <ForwardedVaccinationForm />,
  },

  {
    path: "/main-forwarded-records",
    element: <MainForwardedRecord />,
  },
  {
    path: "/main-forwarded-records/forwarded-chimmunization",
    element: <ForwardedCHimmunization />,
  },
  {
    path: "/main-forwarded-records/pending-medical-con",
    element: <PendingConsultationRecord />,
  },
  {
    path: "/main-forwarded-records/child-health-checkup-history",
    element: <ChildHealthCheckupHistory />,

  },
  {
    path: "/main-forwarded-records/combined-health-records",
    element: <CombinedHealthRecordsTable />,
  },
  {
    path: "/main-forwarded-records/scheduled-vaccinations",
    element: <ScheduledVaccinations />,
  }

];
