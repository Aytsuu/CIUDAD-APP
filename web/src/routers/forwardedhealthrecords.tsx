import ForwardedCHimmunizationTable from "@/pages/healthServices/forwardedrecord/forwardedrecords/ForwardedChildImmunization";
import ForwardedCombinedHealthRecordsTable from "@/pages/healthServices/forwardedrecord/forwardedrecords/ForwardedCombineConsultation";
import ForwardedScheduledVaccinationsTables from "@/pages/healthServices/forwardedrecord/forwardedrecords/ForwardedScheduledVaccinations";
import ForwardedVaccinationRecordsTable from "@/pages/healthServices/forwardedrecord/forwardedrecords/ForwardedVaccination";
import MainForwardedRecord from "@/pages/healthServices/forwardedrecord/Main";
export const forwardedhealthrecord_router = [
  {
    path:"/forwarded-records",
    element: <MainForwardedRecord />
  },
  {
    path: "/forwarded-records/child-health-immunization",
    element: <ForwardedCHimmunizationTable />,
  },
 
  {
    path: "/forwarded-records/medical-consultation",
    element: <ForwardedCombinedHealthRecordsTable />,
  },
  {
    path: "/forwarded-records/vaccine-waitlist",
    element: <ForwardedScheduledVaccinationsTables />,
  },
  {
    path: "/forwarded-records/vitalsigns-queue",
    element: <ForwardedVaccinationRecordsTable />
  },
 


];
