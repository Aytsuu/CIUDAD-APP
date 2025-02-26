import path from "path";
import AppointmentTable from "@/pages/APPOINTMENTSREQUEST/appoinmentTable";
import RequestTable from "@/pages/APPOINTMENTSREQUEST/requestTable";
import AppRequestMain from "@/pages/APPOINTMENTSREQUEST/appreqMain";
export const healthAppointment = [
  {
    path: "/",
    element: <AppRequestMain />,
  },
  {
    path: "/appointmentTable",
    element: <AppointmentTable />,
  },
  {
    path:"/requestTable",
    element:<RequestTable/>
  }
];
