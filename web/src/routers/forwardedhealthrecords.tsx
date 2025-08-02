import MainForwardedRecord from "@/pages/healthServices/forwardedrecord/Main";
import path from "path";
import ForwardedCHimmunization from "@/pages/healthServices/forwardedrecord/forwardedrecords/ChildImmunization";
import CombinedHealthRecordsTable from "@/pages/healthServices/forwardedrecord/forwardedrecords/CombineConsultation";
import ScheduledVaccinations from "@/pages/healthServices/forwardedrecord/forwardedrecords/ScheduledVaccinations";
import ForwardedVaccinationRecords from "@/pages/healthServices/forwardedrecord/forwardedrecords/ForwardedVaccination";

export const forwardedhealthrecord_router = [

  {
    path: "/forwarded-child-health-immunization",
    element: <ForwardedCHimmunization />,
  },
 
  {
    path: "/forwarded-medical-consultation",
    element: <CombinedHealthRecordsTable />,
  },
  {
    path: "/forwarded-vaccine-waitlist",
    element: <ScheduledVaccinations />,
  },
  {
    path: "/forwarded-vitals-queue",
    element: <ForwardedVaccinationRecords />
  },


];
