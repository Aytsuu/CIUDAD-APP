import AppointmentTable from "@/pages/healthRequest/AppoinmentTable";
import RequestTable from "@/pages/healthRequest/MedrequestTable";
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
