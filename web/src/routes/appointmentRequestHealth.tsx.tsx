import path from "path";
import AppointmentTable from "@/pages/healthRequest/appoinmentTable";
import RequestTable from "@/pages/healthRequest/medrequestTable";
import Main from "@/pages/healthRequest/Main";
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
