import path from "path";
import AppointmentTable from "@/pages/APPOINTMENTSREQUEST/appoinmentTable";
import RequestTable from "@/pages/APPOINTMENTSREQUEST/medrequestTable";
import Main from "@/pages/APPOINTMENTSREQUEST/Main";
export const healthAppointment = [
  {
    path: "/mainAppRequestTable",
    element: <Main />,
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
