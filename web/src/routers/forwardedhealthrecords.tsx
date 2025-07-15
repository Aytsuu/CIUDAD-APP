import ForwardedVaccinationRecords from "@/pages/healthServices/forwardedrecord/forwardedrecords/ForwTable";
import ForwardedVaccinationForm from "@/pages/healthServices/forwardedrecord/forwardedrecords/ForwardedVaccination";
import MainForwardedRecord from "@/pages/healthServices/forwardedrecord/Main";
import path from "path";
import ForwardedCHimmunization from "@/pages/healthServices/forwardedrecord/forwardedrecords/ForwardedCHimmunization";
import  PendingConsultationRecord  from "@/pages/healthServices/forwardedrecord/forwardedrecords/forwardedMedicalConsultation";
export const forwardedhealthrecord_router = [
  {
    path: "/forwarded-vaccination-records",
    element: <ForwardedVaccinationRecords />,
  },
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
];
